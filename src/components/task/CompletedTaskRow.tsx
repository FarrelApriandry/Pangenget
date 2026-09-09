/**
 * CompletedTaskRow — Completed task display (Design: Completed Tasks Section)
 *
 * Strikethrough title, dimmed, with undo action.
 */

interface CompletedTaskRowProps {
	title: string;
	categoryName?: string | null;
	completedAt?: string | null;
	onUndo: () => void;
}

export function CompletedTaskRow({
	title,
	categoryName,
	completedAt,
	onUndo,
}: CompletedTaskRowProps) {
	return (
		<div className="p-3.5 rounded-xl bg-surface-muted/60 border border-card-border/30 opacity-70 hover:opacity-100 transition-opacity flex items-center justify-between gap-3">
			<div className="flex items-center gap-3">
				<div className="size-4 rounded-full bg-primary/20 text-primary border border-primary/40 flex items-center justify-center">
					<span className="material-symbols-outlined text-[12px] font-bold">
						check
					</span>
				</div>
				<div>
					<p className="text-sm text-text-muted line-through font-normal">
						{title}
					</p>
					{(categoryName || completedAt) && (
						<div className="flex items-center gap-2 text-xs font-mono text-text-muted/70">
							{categoryName && <span>{categoryName}</span>}
							{categoryName && completedAt && <span>•</span>}
							{completedAt && <span>Selesai {completedAt}</span>}
						</div>
					)}
				</div>
			</div>
			<button
				type="button"
				onClick={onUndo}
				className="text-text-muted hover:text-text-main p-1 transition-colors text-xs flex items-center gap-1"
				title="Batalkan selesai"
			>
				<span className="material-symbols-outlined text-[16px]">undo</span>
				<span className="hidden sm:inline font-mono text-[11px]">Batal</span>
			</button>
		</div>
	);
}
