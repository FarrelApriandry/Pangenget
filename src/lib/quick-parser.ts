/**
 * Quick Parser — Client-side NLP/Regex extraction (FR-1.1)
 *
 * Extracts task title, deadline, priority, and category from a single
 * free-form input string using chrono-node for date parsing and
 * keyword heuristics for priority/category detection.
 */
import * as chrono from "chrono-node";

export interface ParsedTask {
	title: string;
	deadline: Date | null;
	priority: "low" | "medium" | "high";
	categoryName: string | null;
}

// ── Priority keyword maps ─────────────────────────────────
const HIGH_KEYWORDS = [
	"sks",
	"penting",
	"urgent",
	"segera",
	"hari ini",
	"hari-ini",
	"h-1",
	"h-0",
	"deadline",
	"mendesak",
	"kritis",
];

const LOW_KEYWORDS = [
	"santuy",
	"nanti",
	"low",
	"rendah",
	"kalau ada waktu",
	"tidak mendesak",
	"optional",
	"bonus",
];

// ── Category extraction: @tag syntax ───────────────────────
const CATEGORY_RE = /@(\S+)/i;

export function parseQuickInput(raw: string): ParsedTask {
	let text = raw.trim();

	// 1. Extract category via @tag
	let categoryName: string | null = null;
	const catMatch = text.match(CATEGORY_RE);
	if (catMatch) {
		categoryName = catMatch[1];
		text = text.replace(CATEGORY_RE, "").trim();
	}

	// 2. Extract date/time via chrono-node (Indonesian + English)
	const results = chrono.parse(text);
	let deadline: Date | null = null;
	if (results.length > 0) {
		deadline = results[0].start.date();
		// Remove the parsed date text from the title
		text =
			text.slice(0, results[0].index) +
			text.slice(results[0].index + results[0].text.length);
	}

	// 3. Detect priority keywords
	const lower = raw.toLowerCase();
	let priority: "low" | "medium" | "high" = "medium";
	if (HIGH_KEYWORDS.some((kw) => lower.includes(kw))) {
		priority = "high";
	} else if (LOW_KEYWORDS.some((kw) => lower.includes(kw))) {
		priority = "low";
	}

	// 4. Clean up remaining title
	const title = text
		.replace(/\s+/g, " ")
		.replace(/^[,\-–—:;\s]+|[,\-–—:;\s]+$/g, "")
		.trim();

	return {
		title: title || raw.trim(),
		deadline,
		priority,
		categoryName,
	};
}
