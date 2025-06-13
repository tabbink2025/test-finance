import { pgTable, foreignKey, serial, text, numeric, date, integer, boolean, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const goals = pgTable("goals", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	targetAmount: numeric("target_amount", { precision: 12, scale:  2 }).notNull(),
	deadline: date(),
	accountId: integer("account_id").notNull(),
	description: text(),
	isCompleted: boolean("is_completed").default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "goals_account_id_accounts_id_fk"
		}),
]);

export const stocks = pgTable("stocks", {
	id: serial().primaryKey().notNull(),
	symbol: text().notNull(),
	name: text().notNull(),
	shares: numeric({ precision: 12, scale:  4 }).notNull(),
	purchasePrice: numeric("purchase_price", { precision: 12, scale:  2 }).notNull(),
	currentPrice: numeric("current_price", { precision: 12, scale:  2 }).notNull(),
	accountId: integer("account_id").notNull(),
	purchaseDate: date("purchase_date").notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "stocks_account_id_accounts_id_fk"
		}),
]);

export const budgets = pgTable("budgets", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	period: text().default('monthly').notNull(),
	accountId: integer("account_id"),
	categoryId: integer("category_id"),
	isActive: boolean("is_active").default(true).notNull(),
	alertThreshold: numeric("alert_threshold", { precision: 3, scale:  2 }).default('0.80'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "budgets_account_id_accounts_id_fk"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "budgets_category_id_categories_id_fk"
		}),
]);

export const categories = pgTable("categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	type: text().notNull(),
	color: text().default('#059669').notNull(),
	parentId: integer("parent_id"),
});

export const transactions = pgTable("transactions", {
	id: serial().primaryKey().notNull(),
	description: text().notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	type: text().notNull(),
	date: date().notNull(),
	accountId: integer("account_id").notNull(),
	categoryId: integer("category_id"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "transactions_account_id_accounts_id_fk"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "transactions_category_id_categories_id_fk"
		}),
]);

export const accounts = pgTable("accounts", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	type: text().notNull(),
	balance: numeric({ precision: 12, scale:  2 }).default('0').notNull(),
	color: text().default('#2563EB').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	initialBalance: numeric("initial_balance", { precision: 12, scale:  2 }).default('0').notNull(),
});

export const goalAllocations = pgTable("goal_allocations", {
	id: serial().primaryKey().notNull(),
	goalId: integer("goal_id").notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	description: text(),
	date: date().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.goalId],
			foreignColumns: [goals.id],
			name: "goal_allocations_goal_id_goals_id_fk"
		}).onDelete("cascade"),
]);
