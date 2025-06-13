import { relations } from "drizzle-orm/relations";
import { accounts, goals, stocks, budgets, categories, transactions, goalAllocations } from "./schema";

export const goalsRelations = relations(goals, ({one, many}) => ({
	account: one(accounts, {
		fields: [goals.accountId],
		references: [accounts.id]
	}),
	goalAllocations: many(goalAllocations),
}));

export const accountsRelations = relations(accounts, ({many}) => ({
	goals: many(goals),
	stocks: many(stocks),
	budgets: many(budgets),
	transactions: many(transactions),
}));

export const stocksRelations = relations(stocks, ({one}) => ({
	account: one(accounts, {
		fields: [stocks.accountId],
		references: [accounts.id]
	}),
}));

export const budgetsRelations = relations(budgets, ({one}) => ({
	account: one(accounts, {
		fields: [budgets.accountId],
		references: [accounts.id]
	}),
	category: one(categories, {
		fields: [budgets.categoryId],
		references: [categories.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	budgets: many(budgets),
	transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({one}) => ({
	account: one(accounts, {
		fields: [transactions.accountId],
		references: [accounts.id]
	}),
	category: one(categories, {
		fields: [transactions.categoryId],
		references: [categories.id]
	}),
}));

export const goalAllocationsRelations = relations(goalAllocations, ({one}) => ({
	goal: one(goals, {
		fields: [goalAllocations.goalId],
		references: [goals.id]
	}),
}));