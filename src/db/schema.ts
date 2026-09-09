import {
	boolean,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

// ── Enums ─────────────────────────────────────────────────
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);
export const statusEnum = pgEnum("status", [
	"todo",
	"in_progress",
	"completed",
]);

// ── Tables ────────────────────────────────────────────────

export const categories = pgTable("categories", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id").notNull(),
	name: varchar("name", { length: 50 }).notNull(),
	color: varchar("color", { length: 7 }).default("#6366f1"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id").notNull(),
	categoryId: uuid("category_id").references(() => categories.id, {
		onDelete: "set null",
	}),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description"),
	deadline: timestamp("deadline"),
	priority: priorityEnum("priority").default("medium").notNull(),
	status: statusEnum("status").default("todo").notNull(),

	// Daily Focus Reset — FR-1.2
	isMyDay: boolean("is_my_day").default(false).notNull(),

	// Rapid Subtask Breakdown — FR-2.1
	subtasks: jsonb("subtasks")
		.$type<Array<{ id: string; title: string; isCompleted: boolean }>>()
		.default([]),

	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});
