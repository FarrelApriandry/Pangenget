import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { QuickCapture } from "#/components/quick-capture/QuickCapture";
import { TaskCard } from "#/components/task/TaskCard";
import type { ParsedTask } from "#/lib/quick-parser";
import { computeUrgency, type UrgencyLevel } from "#/lib/urgency";
import {
	addSubtask,
	createTask,
	deleteTask,
	getAllTasks,
	getCategories,
	toggleTaskComplete,
} from "#/server/tasks";

type ViewMode = "list" | "kanban";
type StatusFilter = "all" | "active" | "completed" | "overdue";

export const Route = createFileRoute("/tasks")({
	loader: async () => {
		const [allTasks, categories] = await Promise.all([
			getAllTasks(),
			getCategories(),
		]);
		return { allTasks, categories };
	},
	component: TasksPage,
});

function TasksPage() {
	const { allTasks, categories } = Route.useLoaderData();
	const router = useRouter();
	const [viewMode, setViewMode] = useState<ViewMode>("list");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
	const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | null>(null);

	const filteredTasks = useMemo(() => {
		return allTasks.filter((task) => {
			if (statusFilter === "active" && task.status === "completed")
				return false;
			if (statusFilter === "completed" && task.status !== "completed")
				return false;
			if (
				statusFilter === "overdue" &&
				computeUrgency(task.deadline).level !== "overdue"
			)
				return false;
			if (categoryFilter && task.categoryId !== categoryFilter) return false;
			if (
				urgencyFilter &&
				computeUrgency(task.deadline).level !== urgencyFilter
			)
				return false;
			return true;
		});
	}, [allTasks, statusFilter, categoryFilter, urgencyFilter]);

	const handleCreateTask = useCallback(
		async (parsed: ParsedTask) => {
			await createTask({
				data: {
					title: parsed.title,
					deadline: parsed.deadline,
					priority: parsed.priority,
				},
			});
			router.invalidate();
		},
		[router],
	);

	const handleToggleComplete = useCallback(
		async (id: string) => {
			await toggleTaskComplete({ data: { id } });
			router.invalidate();
		},
		[router],
	);

	const handleDelete = useCallback(
		async (id: string) => {
			await deleteTask({ data: { id } });
			router.invalidate();
		},
		[router],
	);

	const handleAddSubtask = useCallback(
		async (taskId: string) => {
			const title = window.prompt("Judul sub-tugas:");
			if (!title?.trim()) return;
			await addSubtask({ data: { taskId, subtaskTitle: title.trim() } });
			router.invalidate();
		},
		[router],
	);

	return (
		<main className="max-w-4xl mx-auto px-6 py-8">
			<div className="mb-6">
				<h1 className="text-2xl font-semibold text-[#e8ecd4] tracking-tight">
					Semua Tugas
				</h1>
				<p className="text-sm text-text-muted mt-1 font-mono">
					{allTasks.length} tugas total
				</p>
			</div>
			<QuickCapture onSubmit={handleCreateTask} />

			<div className="mt-6 flex flex-wrap items-center gap-3">
				<div className="flex items-center rounded-lg border border-card-border/50 overflow-hidden">
					{(
						[
							{ key: "all", label: "Semua" },
							{ key: "active", label: "Aktif" },
							{ key: "completed", label: "Selesai" },
							{ key: "overdue", label: "Terlambat" },
						] as const
					).map((f) => (
						<button
							key={f.key}
							type="button"
							onClick={() => setStatusFilter(f.key)}
							className={`px-3 py-1.5 text-xs font-medium transition-colors ${
								statusFilter === f.key
									? "bg-primary text-on-primary-container"
									: "text-text-muted hover:text-text-main hover:bg-card"
							}`}
						>
							{f.label}
						</button>
					))}
				</div>

				{categories.length > 0 && (
					<select
						value={categoryFilter ?? ""}
						onChange={(e) => setCategoryFilter(e.target.value || null)}
						className="px-3 py-1.5 text-xs font-mono rounded-lg border border-card-border/50 bg-card text-text-main"
					>
						<option value="">Semua Kategori</option>
						{categories.map((cat) => (
							<option key={cat.id} value={cat.id}>
								{cat.name}
							</option>
						))}
					</select>
				)}

				<div className="flex items-center gap-1">
					{(
						[
							{
								key: "safe",
								label: "Aman",
								color: "bg-safe-bg text-safe-text border-safe-border/50",
							},
							{
								key: "warning",
								label: "Waspada",
								color:
									"bg-warning-bg text-warning-text border-warning-border/50",
							},
							{
								key: "critical",
								label: "SKS",
								color: "bg-urgent-bg text-urgent-text border-urgent-border",
							},
							{
								key: "overdue",
								label: "Terlambat",
								color: "bg-urgent-bg text-urgent-text border-urgent-border",
							},
						] as const
					).map((u) => (
						<button
							key={u.key}
							type="button"
							onClick={() =>
								setUrgencyFilter(urgencyFilter === u.key ? null : u.key)
							}
							className={`px-2 py-1 text-[11px] font-mono uppercase tracking-wide rounded border transition-colors ${
								urgencyFilter === u.key
									? u.color
									: "text-text-muted border-card-border/30 hover:border-card-border"
							}`}
						>
							{u.label}
						</button>
					))}
				</div>

				<div className="ml-auto flex items-center rounded-lg border border-card-border/50 overflow-hidden">
					<button
						type="button"
						onClick={() => setViewMode("list")}
						title="Tampilan List"
						className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-primary text-on-primary-container" : "text-text-muted hover:text-text-main"}`}
					>
						<span className="material-symbols-outlined text-[18px]">
							view_list
						</span>
					</button>
					<button
						type="button"
						onClick={() => setViewMode("kanban")}
						title="Tampilan Kanban"
						className={`p-1.5 transition-colors ${viewMode === "kanban" ? "bg-primary text-on-primary-container" : "text-text-muted hover:text-text-main"}`}
					>
						<span className="material-symbols-outlined text-[18px]">
							view_kanban
						</span>
					</button>
				</div>
			</div>

			<div className="mt-6 space-y-3">
				{filteredTasks.length === 0 && (
					<div className="text-center py-16 text-text-muted">
						<span className="material-symbols-outlined text-[48px] mb-3 block opacity-40">
							task_alt
						</span>
						<p className="text-sm">Tidak ada tugas yang cocok.</p>
						<p className="text-xs mt-1">
							Coba ubah filter atau tambah tugas baru.
						</p>
					</div>
				)}
				{filteredTasks.map((task) => (
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
		</main>
	);
}
