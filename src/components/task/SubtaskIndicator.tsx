/**
 * SubtaskIndicator — Progress indicator for subtasks (FR-2.1)
 *
 * Shows completed/total count with a mini progress bar.
 * Matches the design spec: subtask indicator at the bottom of task cards.
 */

interface SubtaskIndicatorProps {
	subtasks: Array<{ id: string; title: string; isCompleted: boolean }>;
	onAddSubtask?: () => void;
}

export function SubtaskIndicator({
	subtasks,
	onAddSubtask,
}: SubtaskIndicatorProps) {
	if (subtasks.length === 0) return null;

	const completed = subtasks.filter((s) => s.isCompleted).length;
	const total = subtasks.length;
	const pct = Math.round((completed / total) * 100);

	// Find first incomplete subtask name for preview
	const nextSubtask = subtasks.find((s) => !s.isCompleted);

	return (
		<div className="pt-2 border-t border-card-border/30 flex items-center justify-between gap-4 text-xs font-mono">
			<div className="flex items-center gap-2 text-text-muted min-w-0">
				<span className="material-symbols-outlined text-[15px] flex-shrink-0">
					subdirectory_arrow_right
				</span>
				<span className="truncate">
					{completed}/{total} sub-tugas
					{nextSubtask && ` · ${nextSubtask.title}`}
				</span>
			</div>

			<div className="flex items-center gap-3 flex-shrink-0">
				<div className="w-24 bg-surface-muted h-1 rounded-full overflow-hidden">
					<div
						className="bg-warning-text/80 h-full rounded-full transition-all duration-300"
						style={{ width: `${pct}%` }}
					/>
				</div>
				{onAddSubtask && (
					<button
						type="button"
						onClick={onAddSubtask}
						className="hover:text-primary transition-colors text-[11px] text-text-muted"
					>
						+ Tambah
					</button>
				)}
			</div>
		</div>
	);
}
