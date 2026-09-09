/**
 * Quick Parser — Client-side NLP/Regex extraction (FR-1.1)
 *
 * Extracts task title, deadline, priority, and category from a single
 * free-form input string.  Supports Bahasa Indonesia date/time phrases
 * natively and falls back to chrono-node for English dates.
 */
import * as chrono from "chrono-node";

export interface ParsedTask {
	title: string;
	deadline: Date | null;
	priority: "low" | "medium" | "high";
	categoryName: string | null;
	rawDateText: string | null;
}

// ── Priority flag keywords ─────────────────────────────────
const FLAG_HIGH = ["urgent", "penting", "tinggi", "high"];
const FLAG_LOW = ["rendah", "low", "santai"];
const FLAG_MEDIUM = ["sedang", "medium"];

const HIGH_HEURISTIC = [
	"sks",
	"segera",
	"hari ini",
	"hari-ini",
	"h-1",
	"h-0",
	"deadline",
	"mendesak",
	"kritis",
];
const LOW_HEURISTIC = [
	"santuy",
	"nanti",
	"tidak mendesak",
	"kalau ada waktu",
	"optional",
	"bonus",
];

// ── Day-name mapping (JS getDay(): Sun=0, Mon=1 … Sat=6) ─
const DAY_NAMES: Record<string, number> = {
	senin: 1,
	selasa: 2,
	rabu: 3,
	kamis: 4,
	jumat: 5,
	sabtu: 6,
	minggu: 0,
};

// ── Regex patterns ─────────────────────────────────────────
const FLAG_RE = /!(\S+)/gi;
const TAG_RE = /(?:#|@)([\w-]+)/gi;
const RELATIVE_DAY_RE = /\b(hari\s+ini|besok|lusa)\b/i;
const DAY_NAME_RE =
	/\b(senin|selasa|rabu|kamis|jumat|sabtu|minggu)(?:\s+depan)?\b/i;
const JAM_TIME_RE = /\bjam\s+(\d{1,2})[.:](\d{2})\b/i;
const BARE_TIME_RE = /\b(\d{1,2})[.:](\d{2})\b/;

// ── Helpers ────────────────────────────────────────────────

function matchAll(pattern: RegExp, text: string): RegExpExecArray[] {
	const re = new RegExp(pattern.source, pattern.flags);
	const out: RegExpExecArray[] = [];
	for (let m = re.exec(text); m !== null; m = re.exec(text)) {
		out.push(m);
	}
	return out;
}

function startOfDay(d: Date): Date {
	const r = new Date(d);
	r.setHours(0, 0, 0, 0);
	return r;
}

function addDays(d: Date, n: number): Date {
	const r = new Date(d);
	r.setDate(r.getDate() + n);
	return r;
}

function nextWeekday(target: number, from: Date): Date {
	let diff = target - from.getDay();
	if (diff <= 0) diff += 7;
	return addDays(from, diff);
}

export function parseQuickInput(raw: string): ParsedTask {
	let text = raw.trim();
	const dateParts: string[] = [];
	let deadline: Date | null = null;
	let rawDateText: string | null = null;

	// ────────────────────────────────────────────────────────
	// 1. Extract & strip priority !flags
	// ────────────────────────────────────────────────────────
	let priority: "low" | "medium" | "high" = "medium";
	const flagMatches = matchAll(FLAG_RE, text);

	for (const m of flagMatches) {
		const word = m[1].toLowerCase();
		if (FLAG_HIGH.includes(word)) priority = "high";
		else if (FLAG_LOW.includes(word)) priority = "low";
		else if (FLAG_MEDIUM.includes(word)) priority = "medium";
		text = text.replace(m[0], " ");
	}

	// Heuristic word-list fallback (on remaining text)
	if (priority === "medium") {
		const lower = text.toLowerCase();
		if (HIGH_HEURISTIC.some((kw) => lower.includes(kw))) priority = "high";
		else if (LOW_HEURISTIC.some((kw) => lower.includes(kw))) priority = "low";
	}

	// ────────────────────────────────────────────────────────
	// 2. Extract & strip category tags (#tag or @tag)
	// ────────────────────────────────────────────────────────
	let categoryName: string | null = null;
	const tagMatches = matchAll(TAG_RE, text);
	for (const m of tagMatches) {
		if (!categoryName) categoryName = m[1];
		text = text.replace(m[0], " ");
	}

	// ────────────────────────────────────────────────────────
	// 3. Indonesian date/time extraction
	// ────────────────────────────────────────────────────────
	const now = new Date();

	// 3a. Relative days
	const relMatch = text.match(RELATIVE_DAY_RE);
	if (relMatch) {
		const word = relMatch[1].toLowerCase().replace(/\s+/g, " ");
		dateParts.push(relMatch[0]);
		text = text.replace(relMatch[0], " ");
		if (word === "hari ini") deadline = startOfDay(now);
		else if (word === "besok") deadline = startOfDay(addDays(now, 1));
		else if (word === "lusa") deadline = startOfDay(addDays(now, 2));
	}

	// 3b. Day names (senin … minggu, optionally + depan)
	if (!deadline) {
		const dayMatch = text.match(DAY_NAME_RE);
		if (dayMatch) {
			const targetDay = DAY_NAMES[dayMatch[1].toLowerCase()];
			if (targetDay !== undefined) {
				let target = nextWeekday(targetDay, startOfDay(now));
				if (/\s+depan/i.test(dayMatch[0])) target = addDays(target, 7);
				deadline = target;
				dateParts.push(dayMatch[0]);
				text = text.replace(dayMatch[0], " ");
			}
		}
	}

	// 3c. Time: "jam HH.MM" or "jam HH:MM"
	let hours = -1;
	let minutes = -1;
	const jamMatch = text.match(JAM_TIME_RE);
	if (jamMatch) {
		hours = Number.parseInt(jamMatch[1], 10);
		minutes = Number.parseInt(jamMatch[2], 10);
		dateParts.push(jamMatch[0]);
		text = text.replace(jamMatch[0], " ");
	}

	// 3d. Bare time "HH.MM" / "HH:MM" (h 0-23, m 0-59 only)
	if (hours === -1) {
		const bareMatch = text.match(BARE_TIME_RE);
		if (bareMatch) {
			const h = Number.parseInt(bareMatch[1], 10);
			const m = Number.parseInt(bareMatch[2], 10);
			if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
				hours = h;
				minutes = m;
				dateParts.push(bareMatch[0]);
				text = text.replace(bareMatch[0], " ");
			}
		}
	}

	// 3e. Apply time to deadline; default 23:59 when date-only
	if (deadline) {
		if (hours >= 0 && minutes >= 0) {
			deadline.setHours(hours, minutes, 0, 0);
		} else {
			deadline.setHours(23, 59, 0, 0);
		}
		rawDateText = dateParts.join(" ");
	}

	// ────────────────────────────────────────────────────────
	// 4. chrono-node fallback (English / mixed dates)
	// ────────────────────────────────────────────────────────
	if (!deadline) {
		const results = chrono.parse(text);
		if (results.length > 0) {
			const r = results[0];
			deadline = r.start.date();
			rawDateText = r.text;
			text = text.slice(0, r.index) + text.slice(r.index + r.text.length);
		}
	}

	// ────────────────────────────────────────────────────────
	// 5. Sanitize remaining title
	// ────────────────────────────────────────────────────────
	const title = text
		.replace(/\s+/g, " ")
		.replace(/^[,\-–—:;\s]+|[,\-–—:;\s]+$/g, "")
		.trim();

	return {
		title: title || raw.trim(),
		deadline,
		priority,
		categoryName,
		rawDateText,
	};
}
