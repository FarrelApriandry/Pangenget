/**
 * Urgency Radar / SKS Mode — FR-2.2
 *
 * Computes a visual urgency level based on deadline proximity.
 *
 *   "safe"     — ≥ 3 days remaining  → Santuy
 *   "warning"  — 1-2 days remaining  → Waspada
 *   "critical" — < 24 hours remaining → SKS Mode
 *   "overdue"  — past deadline        → Terlambat
 */

export type UrgencyLevel = "safe" | "warning" | "critical" | "overdue";

export interface UrgencyInfo {
	level: UrgencyLevel;
	label: string;
	daysRemaining: number | null;
}

export function computeUrgency(deadline: Date | string | null): UrgencyInfo {
	if (!deadline) {
		return { level: "safe", label: "Tanpa Deadline", daysRemaining: null };
	}

	const now = new Date();
	const dl = typeof deadline === "string" ? new Date(deadline) : deadline;
	const diffMs = dl.getTime() - now.getTime();
	const diffHours = diffMs / (1000 * 60 * 60);
	const diffDays = diffMs / (1000 * 60 * 60 * 24);

	if (diffMs < 0) {
		return { level: "overdue", label: "Terlambat", daysRemaining: 0 };
	}

	if (diffHours < 24) {
		return { level: "critical", label: "SKS Mode", daysRemaining: 0 };
	}

	if (diffDays < 3) {
		return {
			level: "warning",
			label: "Waspada",
			daysRemaining: Math.ceil(diffDays),
		};
	}

	return {
		level: "safe",
		label: "Aman",
		daysRemaining: Math.ceil(diffDays),
	};
}

// ── Style maps for urgency chips ──────────────────────────
export const URGENCY_STYLES: Record<
	UrgencyLevel,
	{ bg: string; text: string; border: string }
> = {
	safe: {
		bg: "bg-safe-bg",
		text: "text-safe-text",
		border: "border-safe-border/50",
	},
	warning: {
		bg: "bg-warning-bg",
		text: "text-warning-text",
		border: "border-warning-border/50",
	},
	critical: {
		bg: "bg-urgent-bg",
		text: "text-urgent-text",
		border: "border-urgent-border",
	},
	overdue: {
		bg: "bg-urgent-bg",
		text: "text-urgent-text",
		border: "border-urgent-border",
	},
};

export const URGENCY_INDICATOR_COLORS: Record<UrgencyLevel, string> = {
	safe: "bg-safe-text",
	warning: "bg-warning-text",
	critical: "bg-urgent-text",
	overdue: "bg-urgent-text",
};
