/**
 * RecommendationList — Smart task suggestions for My Day (FR-1.2)
 *
 * Displays backlog or deadline-proximate tasks as suggestions
 * for the user to consciously add to their daily focus.
 */

interface RecommendedTask {
	id: string;
	title: string;
	priority: "low" | "medium" | "high";
	deadline: Date | string | null;
	categoryName?: string | null;
}

interface RecommendationListProps {
	tasks: RecommendedTask[];
	onAddToMyDay: (id: string) => void;
}

export function RecommendationList({
	tasks,
	onAddToMyDay,
}: RecommendationListProps) {
	if (tasks.length === 0) return null;

	return (
		<div className="mt-8">
			<div className="flex items-center gap-2 mb-3">
				<span className="material-symbols-outlined text-primary text-[18px]">
					lightbulb
				</span>
				<h3 className="text-sm font-semibold text-text-main">
					Rekomendasi Hari Ini
				</h3>
			</div>
			<p className="text-xs text-text-muted mb-4">
				Tugas berikut punya deadline dekat atau prioritas tinggi. Pilih yang
				ingin kamu fokuskan hari ini.
			</p>

			<div className="space-y-2">
				{tasks.map((task) => (
					<div
						key={task.id}
						className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-muted/50 border border-card-border/30 hover:border-card-border/60 transition-colors"
					>
						<div className="flex-1 min-w-0">
							<p className="text-sm text-text-main truncate">{task.title}</p>
							<div className="flex items-center gap-2 mt-1 text-[11px] text-text-muted font-mono">
								{task.categoryName && <span>{task.categoryName}</span>}
								{task.priority === "high" && (
									<span className="text-urgent-text">▲ Prioritas Tinggi</span>
								)}
							</div>
						</div>
						<button
							type="button"
							onClick={() => onAddToMyDay(task.id)}
							className="text-xs text-primary hover:text-primary-hover font-medium transition-colors flex items-center gap-1 flex-shrink-0"
						>
							<span className="material-symbols-outlined text-[14px]">add</span>
							Tambah
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
