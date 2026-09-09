/**
 * TaskCard — Main task card (Design: Task Cards)
 *
 * Formed from #414833 background with 1px outline.
 * Left-side urgency indicator strip, title, metadata chips,
 * subtask indicator, hover actions.
 */
import { computeUrgency } from "#/lib/urgency";
import { SubtaskIndicator } from "./SubtaskIndicator";
import { TaskCheckbox } from "./TaskCheckbox";
import { UrgencyChip } from "./UrgencyChip";

interface TaskCardProps {
	id: string;
	title: string;
	deadline: Date | string | null;
	priority: "low" | "medium" | "high";
	categoryName?: string | null;
	subtasks: Array<{ id: string; title: string; isCompleted: boolean }>;
	description?: string | null;
	onToggleComplete: (id: string) => void;
	onDelete?: (id: string) => void;
	onAddSubtask?: (taskId: string) => void;
}

export function TaskCard({
	id,
	title,
	deadline,
	priority,
	categoryName,
	subtasks,
	description,
	onToggleComplete,
	onDelete,
	onAddSubtask,
}: TaskCardProps) {
	const urgency = computeUrgency(deadline);

	const indicatorColorMap: Record<string, string> = {
		safe: "bg-safe-text",
		warning: "bg-warning-text",
		critical: "bg-urgent-text",
		overdue: "bg-urgent-text",
	};

	return (
		<div className="group relative p-4 rounded-xl bg-card border border-card-border/50 hover:border-card-border hover:bg-[#303c27] transition-all flex flex-col gap-3">
			{/* Urgency indicator strip */}
			<div
				className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${indicatorColorMap[urgency.level]}`}
			/>

			{/* Header row */}
			<div className="flex items-start justify-between gap-3 pl-2">
				<div className="flex items-start gap-3 flex-1">
					<TaskCheckbox checked={false} onChange={() => onToggleComplete(id)} />

					<div className="flex-1 min-w-0">
						<h2 className="text-sm font-semibold text-[#e8ecd4] group-hover:text-white transition-colors leading-snug">
							{title}
						</h2>

						{description && (
							<p className="text-xs text-text-muted mt-1 line-clamp-2">
								{description}
							</p>
						)}

						<div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
							{categoryName && (
								<span className="px-2 py-0.5 rounded bg-surface-muted text-text-muted font-mono text-[11px] border border-card-border/40">
									{categoryName}
								</span>
							)}
							<UrgencyChip urgency={urgency} />
							{priority === "high" && (
								<span className="px-2 py-0.5 rounded bg-urgent-bg/30 text-urgent-text font-mono text-[11px] border border-urgent-border/30">
									Prioritas Tinggi
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Hover actions */}
				<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<button
						type="button"
						onClick={() => onDelete?.(id)}
						className="text-text-muted hover:text-error p-1 transition-colors"
						title="Hapus tugas"
					>
						<span className="material-symbols-outlined text-[16px]">
							delete
						</span>
					</button>
				</div>
			</div>

			{/* Subtask indicator */}
			<SubtaskIndicator
				subtasks={subtasks}
				onAddSubtask={onAddSubtask ? () => onAddSubtask(id) : undefined}
			/>
		</div>
	);
}
