import { relations } from "drizzle-orm";
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

// ── Auth Tables ───────────────────────────────────────────

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	name: varchar("name", { length: 100 }),
	createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	expiresAt: timestamp("expires_at").notNull(),
});

// ── App Tables ────────────────────────────────────────────

export const categories = pgTable("categories", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	name: varchar("name", { length: 50 }).notNull(),
	color: varchar("color", { length: 7 }).default("#6366f1"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
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

// ── Relations ──────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	tasks: many(tasks),
	categories: many(categories),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
	tasks: many(tasks),
	user: one(users, {
		fields: [categories.userId],
		references: [users.id],
	}),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
	category: one(categories, {
		fields: [tasks.categoryId],
		references: [categories.id],
	}),
	user: one(users, {
		fields: [tasks.userId],
		references: [users.id],
	}),
}));
