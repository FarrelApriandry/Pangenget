import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import { MyDayHeader } from "#/components/day/MyDayHeader";
import { RecommendationList } from "#/components/day/RecommendationList";
import { QuickCapture } from "#/components/quick-capture/QuickCapture";
import { CompletedTaskRow } from "#/components/task/CompletedTaskRow";
import { TaskCard } from "#/components/task/TaskCard";
import type { ParsedTask } from "#/lib/quick-parser";
import { addToMyDay, resetMyDay } from "#/server/focus";
import {
	addSubtask,
	createTask,
	deleteTask,
	getCompletedToday,
	getMyDayTasks,
	getRecommendedTasks,
	toggleTaskComplete,
} from "#/server/tasks";

export const Route = createFileRoute("/")({
	loader: async () => {
		// Auth guard: redirect to login if no valid session
		try {
			await resetMyDay();
		} catch {
			throw redirect({ to: "/login" });
		}

		const [myDayTasks, completedTasks, recommendedTasks] = await Promise.all([
			getMyDayTasks(),
			getCompletedToday(),
			getRecommendedTasks(),
		]);

		return { myDayTasks, completedTasks, recommendedTasks };
	},
	component: IndexPage,
});

function IndexPage() {
	const { myDayTasks, completedTasks, recommendedTasks } =
		Route.useLoaderData();
	const router = useRouter();

	// ── Mutation: create task via QuickCapture ─────────────
	const handleCreateTask = useCallback(
		async (parsed: ParsedTask) => {
			await createTask({
				data: {
					title: parsed.title,
					deadline: parsed.deadline,
					priority: parsed.priority,
					categoryName: parsed.categoryName,
					isMyDay: true,
				},
			});
			router.invalidate();
		},
		[router],
	);

	// ── Mutation: toggle task complete ─────────────────────
	const handleToggleComplete = useCallback(
		async (id: string) => {
			await toggleTaskComplete({ data: { id } });
			router.invalidate();
		},
		[router],
	);

	// ── Mutation: delete task ──────────────────────────────
	const handleDelete = useCallback(
		async (id: string) => {
			await deleteTask({ data: { id } });
			router.invalidate();
		},
		[router],
	);

	// ── Mutation: add subtask ──────────────────────────────
	const handleAddSubtask = useCallback(
		async (taskId: string) => {
			const title = window.prompt("Judul sub-tugas:");
			if (!title?.trim()) return;
			await addSubtask({ data: { taskId, subtaskTitle: title.trim() } });
			router.invalidate();
		},
		[router],
	);

	// ── Mutation: add recommended task to My Day ───────────
	const handleAddToMyDay = useCallback(
		async (id: string) => {
			await addToMyDay({ data: { id } });
			router.invalidate();
		},
		[router],
	);

	// ── Undo completed task ────────────────────────────────
	const handleUndoComplete = useCallback(
		async (id: string) => {
			await toggleTaskComplete({ data: { id } });
			router.invalidate();
		},
		[router],
	);

	return (
		<main className="max-w-4xl mx-auto px-6 py-8">
			<MyDayHeader />

			{/* Quick Capture */}
			<QuickCapture onSubmit={handleCreateTask} />

			{/* Active My Day tasks */}
			<div className="mt-8 space-y-3">
				{myDayTasks.length === 0 && (
					<div className="text-center py-12 text-text-muted">
						<span className="material-symbols-outlined text-[48px] mb-3 block opacity-40">
							wb_sunny
						</span>
						<p className="text-sm">Belum ada tugas di My Day hari ini.</p>
						<p className="text-xs mt-1">
							Tambah tugas lewat input di atas atau pilih dari rekomendasi di
							bawah.
						</p>
					</div>
				)}

				{myDayTasks.map((task) => (
					<TaskCard
						key={task.id}
						id={task.id}
						title={task.title}
						deadline={task.deadline}
						priority={task.priority}
						categoryName={task.category?.name ?? null}
						subtasks={
							(task.subtasks as Array<{
								id: string;
								title: string;
								isCompleted: boolean;
							}>) ?? []
						}
						description={task.description}
						onToggleComplete={handleToggleComplete}
						onDelete={handleDelete}
						onAddSubtask={handleAddSubtask}
					/>
				))}
			</div>

			{/* Completed tasks section */}
			{completedTasks.length > 0 && (
				<div className="mt-10 pt-6 border-t border-card-border/40">
					<div className="flex items-center justify-between px-1 mb-3">
						<span className="text-xs text-text-muted font-mono uppercase tracking-wider">
							Selesai Hari Ini ({completedTasks.length})
						</span>
					</div>
					<div className="space-y-2">
						{completedTasks.map((task) => (
							<CompletedTaskRow
								key={task.id}
								title={task.title}
								categoryName={task.category?.name ?? null}
								completedAt={
									task.updatedAt
										? new Date(task.updatedAt).toLocaleTimeString("id-ID", {
												hour: "2-digit",
												minute: "2-digit",
											})
										: null
								}
								onUndo={() => handleUndoComplete(task.id)}
							/>
						))}
					</div>
				</div>
			)}

			{/* Recommendations — show when active tasks < 3 */}
			{myDayTasks.length < 3 && recommendedTasks.length > 0 && (
				<RecommendationList
					tasks={recommendedTasks.map((t) => ({
						id: t.id,
						title: t.title,
						priority: t.priority,
						deadline: t.deadline,
						categoryName: t.category?.name ?? null,
					}))}
					onAddToMyDay={handleAddToMyDay}
				/>
			)}
		</main>
	);
}
