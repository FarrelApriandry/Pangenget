/**
 * UrgencyChip — Visual urgency indicator pill (FR-2.2)
 *
 * Renders the urgency level with the appropriate style from DESIGN.md:
 * - Safe: olive tones
 * - Warning: amber tones
 * - Critical/SKS: dark brown with square glyph
 */
import { URGENCY_STYLES, type UrgencyInfo } from "#/lib/urgency";

interface UrgencyChipProps {
	urgency: UrgencyInfo;
}

export function UrgencyChip({ urgency }: UrgencyChipProps) {
	const styles = URGENCY_STYLES[urgency.level];

	return (
		<span
			className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wide border ${styles.bg} ${styles.text} ${styles.border}`}
		>
			{urgency.level === "critical" && <span aria-hidden="true">■</span>}
			{urgency.label}
			{urgency.daysRemaining != null && urgency.level !== "overdue" && (
				<span className="opacity-70">
					·{" "}
					{urgency.daysRemaining === 0
						? "hari ini"
						: `${urgency.daysRemaining} hari lagi`}
				</span>
			)}
		</span>
	);
}
