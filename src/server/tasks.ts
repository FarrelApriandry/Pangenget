/**
 * Task CRUD Server Functions — FR-1.1, FR-2.1, FR-2.3
 *
 * All task operations via TanStack Start createServerFn.
 * Uses a placeholder userId until Neon Auth is wired.
 */
import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq, or } from "drizzle-orm";

import { db } from "#/db";
import { categories, tasks } from "#/db/schema";

// TODO: Replace with real auth session when Neon Auth is integrated.
const DEV_USER_ID = "dev-user";

// ── GET: My Day tasks ─────────────────────────────────────
export const getMyDayTasks = createServerFn({ method: "GET" }).handler(
	async () => {
		return db.query.tasks.findMany({
			where: and(
				eq(tasks.userId, DEV_USER_ID),
				eq(tasks.isMyDay, true),
				or(eq(tasks.status, "todo"), eq(tasks.status, "in_progress")),
			),
			with: { category: true },
			orderBy: [desc(tasks.priority), asc(tasks.deadline)],
		});
	},
);

// ── GET: All tasks (active + completed) ───────────────────
export const getAllTasks = createServerFn({ method: "GET" }).handler(
	async () => {
		return db.query.tasks.findMany({
			where: eq(tasks.userId, DEV_USER_ID),
			with: { category: true },
			orderBy: [desc(tasks.createdAt)],
		});
	},
);

// ── GET: Completed today ───────────────────────────────────
export const getCompletedToday = createServerFn({ method: "GET" }).handler(
	async () => {
		return db.query.tasks.findMany({
			where: and(
				eq(tasks.userId, DEV_USER_ID),
				eq(tasks.status, "completed"),
				eq(tasks.isMyDay, true),
			),
			with: { category: true },
			orderBy: [desc(tasks.updatedAt)],
		});
	},
);

// ── POST: Create task ──────────────────────────────────────
export const createTask = createServerFn({ method: "POST" })
	.validator(
		(data: {
			title: string;
			description?: string;
			deadline?: Date | null;
			priority?: "low" | "medium" | "high";
			categoryId?: string | null;
			isMyDay?: boolean;
		}) => data,
	)
	.handler(async ({ data }) => {
		const [task] = await db
			.insert(tasks)
			.values({
				userId: DEV_USER_ID,
				title: data.title,
				description: data.description ?? null,
				deadline: data.deadline ?? null,
				priority: data.priority ?? "medium",
				isMyDay: data.isMyDay ?? false,
				categoryId: data.categoryId ?? null,
			})
			.returning();

		return task;
	});

// ── POST: Toggle task complete ─────────────────────────────
export const toggleTaskComplete = createServerFn({ method: "POST" })
	.validator((data: { id: string }) => data)
	.handler(async ({ data }) => {
		const task = await db.query.tasks.findFirst({
			where: eq(tasks.id, data.id),
		});

		if (!task) throw new Error("Task not found");

		const newStatus = task.status === "completed" ? "todo" : "completed";

		const [updated] = await db
			.update(tasks)
			.set({ status: newStatus, updatedAt: new Date() })
			.where(eq(tasks.id, data.id))
			.returning();

		return updated;
	});

// ── POST: Update task status ───────────────────────────────
export const updateTaskStatus = createServerFn({ method: "POST" })
	.validator(
		(data: { id: string; status: "todo" | "in_progress" | "completed" }) =>
			data,
	)
	.handler(async ({ data }) => {
		const [updated] = await db
			.update(tasks)
			.set({ status: data.status, updatedAt: new Date() })
			.where(eq(tasks.id, data.id))
			.returning();

		return updated;
	});

// ── POST: Delete task ──────────────────────────────────────
export const deleteTask = createServerFn({ method: "POST" })
	.validator((data: { id: string }) => data)
	.handler(async ({ data }) => {
		await db.delete(tasks).where(eq(tasks.id, data.id));
		return { success: true };
	});

// ── Helper: cast subtasks from jsonb ───────────────────────
type Subtask = { id: string; title: string; isCompleted: boolean };
function castSubtasks(raw: unknown): Subtask[] {
	return (raw as Subtask[] | null) ?? [];
}

// ── POST: Add subtask ──────────────────────────────────────
export const addSubtask = createServerFn({ method: "POST" })
	.validator((data: { taskId: string; subtaskTitle: string }) => data)
	.handler(async ({ data }) => {
		const task = await db.query.tasks.findFirst({
			where: eq(tasks.id, data.taskId),
		});

		if (!task) throw new Error("Task not found");

		const existing = castSubtasks(task.subtasks);

		const newSubtask: Subtask = {
			id: crypto.randomUUID(),
			title: data.subtaskTitle,
			isCompleted: false,
		};

		const [updated] = await db
			.update(tasks)
			.set({ subtasks: [...existing, newSubtask], updatedAt: new Date() })
			.where(eq(tasks.id, data.taskId))
			.returning();

		return updated;
	});

// ── POST: Toggle subtask ───────────────────────────────────
export const toggleSubtask = createServerFn({ method: "POST" })
	.validator((data: { taskId: string; subtaskId: string }) => data)
	.handler(async ({ data }) => {
		const task = await db.query.tasks.findFirst({
			where: eq(tasks.id, data.taskId),
		});

		if (!task) throw new Error("Task not found");

		const subtasks = castSubtasks(task.subtasks);

		const updatedSubtasks = subtasks.map((st) =>
			st.id === data.subtaskId ? { ...st, isCompleted: !st.isCompleted } : st,
		);

		const [updated] = await db
			.update(tasks)
			.set({ subtasks: updatedSubtasks, updatedAt: new Date() })
			.where(eq(tasks.id, data.taskId))
			.returning();

		return updated;
	});

// ── POST: Toggle My Day ────────────────────────────────────
export const toggleMyDay = createServerFn({ method: "POST" })
	.validator((data: { id: string }) => data)
	.handler(async ({ data }) => {
		const task = await db.query.tasks.findFirst({
			where: eq(tasks.id, data.id),
		});

		if (!task) throw new Error("Task not found");

		const [updated] = await db
			.update(tasks)
			.set({ isMyDay: !task.isMyDay, updatedAt: new Date() })
			.where(eq(tasks.id, data.id))
			.returning();

		return updated;
	});

// ── GET: Recommendation tasks (eligible for My Day) ───────
export const getRecommendedTasks = createServerFn({ method: "GET" }).handler(
	async () => {
		return db.query.tasks.findMany({
			where: and(
				eq(tasks.userId, DEV_USER_ID),
				eq(tasks.isMyDay, false),
				or(eq(tasks.status, "todo"), eq(tasks.status, "in_progress")),
			),
			with: { category: true },
			orderBy: [desc(tasks.priority), asc(tasks.deadline)],
			limit: 5,
		});
	},
);

// ── GET: All categories ────────────────────────────────────
export const getCategories = createServerFn({ method: "GET" }).handler(
	async () => {
		return db.query.categories.findMany({
			where: eq(categories.userId, DEV_USER_ID),
			orderBy: [asc(categories.name)],
		});
	},
);

// ── POST: Create category ──────────────────────────────────
export const createCategory = createServerFn({ method: "POST" })
	.validator((data: { name: string; color?: string }) => data)
	.handler(async ({ data }) => {
		const [cat] = await db
			.insert(categories)
			.values({
				userId: DEV_USER_ID,
				name: data.name,
				color: data.color ?? "#6366f1",
			})
			.returning();

		return cat;
	});
