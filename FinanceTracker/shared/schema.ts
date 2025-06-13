import { pgTable, text, serial, integer, boolean, timestamp, decimal, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'checking', 'savings', 'credit', 'investment'
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default("0"),
  initialBalance: decimal("initial_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  color: text("color").notNull().default("#2563EB"),
  isActive: boolean("is_active").notNull().default(true),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'income', 'expense'
  color: text("color").notNull().default("#059669"),
  parentId: integer("parent_id"), // Remove self-reference for now
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'income', 'expense', 'transfer'
  date: date("date").notNull(),
  accountId: integer("account_id").notNull().references(() => accounts.id),
  categoryId: integer("category_id").references(() => categories.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  deadline: date("deadline"),
  accountId: integer("account_id").notNull().references(() => accounts.id),
  description: text("description"),
  isCompleted: boolean("is_completed").notNull().default(false),
});

export const goalAllocations = pgTable("goal_allocations", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull().references(() => goals.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  period: text("period").notNull().default("monthly"), // monthly, weekly, yearly
  accountId: integer("account_id").references(() => accounts.id),
  categoryId: integer("category_id").references(() => categories.id),
  isActive: boolean("is_active").notNull().default(true),
  alertThreshold: decimal("alert_threshold", { precision: 3, scale: 2 }).default("0.80"), // 80%
  createdAt: timestamp("created_at").defaultNow(),
});

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(), // e.g., 'AAPL', 'TSLA'
  name: text("name").notNull(), // e.g., 'Apple Inc.'
  shares: decimal("shares", { precision: 12, scale: 4 }).notNull(), // Number of shares owned
  purchasePrice: decimal("purchase_price", { precision: 12, scale: 2 }).notNull(), // Price per share when purchased
  currentPrice: decimal("current_price", { precision: 12, scale: 2 }).notNull(), // Current market price per share
  accountId: integer("account_id").notNull().references(() => accounts.id),
  purchaseDate: date("purchase_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const savingTactics = pgTable("saving_tactics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'budgeting', 'automation', 'mindset', 'lifestyle', 'investment', 'emergency', 'custom'
  difficulty: text("difficulty").notNull(), // 'easy', 'medium', 'hard'
  estimatedSavings: text("estimated_savings"), // e.g., '$50/month', '10% of income', 'varies'
  timeToImplement: text("time_to_implement"), // e.g., '1 hour', '1 week', 'ongoing'
  tags: text("tags"), // JSON array of tags as string
  isPersonal: boolean("is_personal").notNull().default(false), // false for default tactics, true for user-created
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
});

export const insertGoalAllocationSchema = createInsertSchema(goalAllocations).omit({
  id: true,
  createdAt: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
});

export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSavingTacticSchema = createInsertSchema(savingTactics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;

export type GoalAllocation = typeof goalAllocations.$inferSelect;
export type InsertGoalAllocation = z.infer<typeof insertGoalAllocationSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type Stock = typeof stocks.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;

export type SavingTactic = typeof savingTactics.$inferSelect;
export type InsertSavingTactic = z.infer<typeof insertSavingTacticSchema>;
