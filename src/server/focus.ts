/**
 * Daily Focus Reset — FR-1.2
 *
 * Server function for the "My Day" daily reset logic.
 * Clears all `isMyDay` flags at the start of each new day
 * so the user gets a clean slate every morning.
 */
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";

import { db } from "#/db";
import { tasks } from "#/db/schema";

const DEV_USER_ID = "dev-user";

// ── POST: Reset My Day ─────────────────────────────────────
export const resetMyDay = createServerFn({ method: "POST" }).handler(
	async () => {
		const result = await db
			.update(tasks)
			.set({ isMyDay: false })
			.where(and(eq(tasks.userId, DEV_USER_ID), eq(tasks.isMyDay, true)))
			.returning({ id: tasks.id });

		return { cleared: result.length };
	},
);

// ── POST: Add task to My Day ───────────────────────────────
export const addToMyDay = createServerFn({ method: "POST" })
	.validator((data: { id: string }) => data)
	.handler(async ({ data }) => {
		const [updated] = await db
			.update(tasks)
			.set({ isMyDay: true })
			.where(eq(tasks.id, data.id))
			.returning();

		return updated;
	});

// ── POST: Remove task from My Day ──────────────────────────
export const removeFromMyDay = createServerFn({ method: "POST" })
	.validator((data: { id: string }) => data)
	.handler(async ({ data }) => {
		const [updated] = await db
			.update(tasks)
			.set({ isMyDay: false })
			.where(eq(tasks.id, data.id))
			.returning();

		return updated;
	});
