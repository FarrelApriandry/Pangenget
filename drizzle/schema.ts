import { pgTable, uuid, text, varchar, timestamp, foreignKey, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const priority = pgEnum("priority", ['low', 'medium', 'high'])
export const status = pgEnum("status", ['todo', 'in_progress', 'completed'])


export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: varchar({ length: 50 }).notNull(),
	color: varchar({ length: 7 }).default('#6366f1'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const tasks = pgTable("tasks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	categoryId: uuid("category_id"),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	deadline: timestamp({ mode: 'string' }),
	priority: priority().default('medium').notNull(),
	status: status().default('todo').notNull(),
	isMyDay: boolean("is_my_day").default(false).notNull(),
	subtasks: jsonb().default([]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "tasks_category_id_categories_id_fk"
		}).onDelete("set null"),
]);
