import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, gte, lte } from "drizzle-orm";
import { Pool } from "pg";
import {
  accounts,
  categories,
  transactions,
  goals,
  budgets,
  stocks,
  type Account,
  type InsertAccount,
  type Category,
  type InsertCategory,
  type Transaction,
  type InsertTransaction,
  type Goal,
  type InsertGoal,
  type Budget,
  type InsertBudget,
  type Stock,
  type InsertStock,
} from "@shared/schema";

export interface IStorage {
  getAccounts(): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<boolean>;

  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByAccount(accountId: number): Promise<Transaction[]>;
  getTransactionsByCategory(categoryId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;

  getGoals(): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  getGoalsByAccount(accountId: number): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;

  getBudgets(): Promise<Budget[]>;
  getBudget(id: number): Promise<Budget | undefined>;
  getBudgetsByAccount(accountId: number): Promise<Budget[]>;
  getBudgetsByCategory(categoryId: number): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;
  getBudgetSpending(budgetId: number): Promise<number>;

  getStocks(): Promise<Stock[]>;
  getStock(id: number): Promise<Stock | undefined>;
  getStocksByAccount(accountId: number): Promise<Stock[]>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStock(id: number, stock: Partial<InsertStock>): Promise<Stock | undefined>;
  deleteStock(id: number): Promise<boolean>;
  updateStockPrice(id: number, newPrice: string): Promise<Stock | undefined>;
  getAccountStockValue(accountId: number): Promise<number>;
}

export class PostgresStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL env var not set");
    }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
  }

  // Accounts
  async getAccounts(): Promise<Account[]> {
    return this.db.select().from(accounts);
  }

  async getAccount(id: number): Promise<Account | undefined> {
    const result = await this.db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id));
    return result[0];
  }

  async createAccount(data: InsertAccount): Promise<Account> {
    const result = await this.db.insert(accounts).values(data).returning();
    return result[0];
  }

  async updateAccount(id: number, data: Partial<InsertAccount>): Promise<Account | undefined> {
    const result = await this.db
      .update(accounts)
      .set(data)
      .where(eq(accounts.id, id))
      .returning();
    return result[0];
  }

  async deleteAccount(id: number): Promise<boolean> {
    const result = await this.db.delete(accounts).where(eq(accounts.id, id)).returning({ id: accounts.id });
    return result.length > 0;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const result = await this.db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async createCategory(data: InsertCategory): Promise<Category> {
    const result = await this.db.insert(categories).values(data).returning();
    return result[0];
  }

  async updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await this.db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await this.db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
    return result.length > 0;
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return this.db.select().from(transactions);
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const result = await this.db.select().from(transactions).where(eq(transactions.id, id));
    return result[0];
  }

  async getTransactionsByAccount(accountId: number): Promise<Transaction[]> {
    return this.db.select().from(transactions).where(eq(transactions.accountId, accountId));
  }

  async getTransactionsByCategory(categoryId: number): Promise<Transaction[]> {
    return this.db.select().from(transactions).where(eq(transactions.categoryId, categoryId));
  }

  async createTransaction(data: InsertTransaction): Promise<Transaction> {
    const result = await this.db.insert(transactions).values(data).returning();
    return result[0];
  }

  async updateTransaction(id: number, data: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const result = await this.db
      .update(transactions)
      .set(data)
      .where(eq(transactions.id, id))
      .returning();
    return result[0];
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const result = await this.db.delete(transactions).where(eq(transactions.id, id)).returning({ id: transactions.id });
    return result.length > 0;
  }

  // Goals
  async getGoals(): Promise<Goal[]> {
    return this.db.select().from(goals);
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    const result = await this.db.select().from(goals).where(eq(goals.id, id));
    return result[0];
  }

  async getGoalsByAccount(accountId: number): Promise<Goal[]> {
    return this.db.select().from(goals).where(eq(goals.accountId, accountId));
  }

  async createGoal(data: InsertGoal): Promise<Goal> {
    const result = await this.db.insert(goals).values(data).returning();
    return result[0];
  }

  async updateGoal(id: number, data: Partial<InsertGoal>): Promise<Goal | undefined> {
    const result = await this.db.update(goals).set(data).where(eq(goals.id, id)).returning();
    return result[0];
  }

  async deleteGoal(id: number): Promise<boolean> {
    const result = await this.db.delete(goals).where(eq(goals.id, id)).returning({ id: goals.id });
    return result.length > 0;
  }

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    return this.db.select().from(budgets);
  }

  async getBudget(id: number): Promise<Budget | undefined> {
    const result = await this.db.select().from(budgets).where(eq(budgets.id, id));
    return result[0];
  }

  async getBudgetsByAccount(accountId: number): Promise<Budget[]> {
    return this.db.select().from(budgets).where(eq(budgets.accountId, accountId));
  }

  async getBudgetsByCategory(categoryId: number): Promise<Budget[]> {
    return this.db.select().from(budgets).where(eq(budgets.categoryId, categoryId));
  }

  async createBudget(data: InsertBudget): Promise<Budget> {
    const result = await this.db.insert(budgets).values(data).returning();
    return result[0];
  }

  async updateBudget(id: number, data: Partial<InsertBudget>): Promise<Budget | undefined> {
    const result = await this.db.update(budgets).set(data).where(eq(budgets.id, id)).returning();
    return result[0];
  }

  async deleteBudget(id: number): Promise<boolean> {
    const result = await this.db.delete(budgets).where(eq(budgets.id, id)).returning({ id: budgets.id });
    return result.length > 0;
  }

  async getBudgetSpending(budgetId: number): Promise<number> {
    const budget = await this.getBudget(budgetId);
    if (!budget) return 0;

    const now = new Date();
    let startDate: Date;
    switch (budget.period) {
      case 'weekly': {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        break;
      }
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'monthly':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const conditions = [
      gte(transactions.date, startDate),
      lte(transactions.date, now),
      eq(transactions.type, 'expense'),
    ];
    if (budget.accountId) conditions.push(eq(transactions.accountId, budget.accountId));
    if (budget.categoryId) conditions.push(eq(transactions.categoryId, budget.categoryId));

    const rows = await this.db
      .select({ amount: transactions.amount })
      .from(transactions)
      .where(and(...conditions));

    return rows.reduce((sum, row) => sum + parseFloat(row.amount as unknown as string), 0);
  }

  // Stocks
  async getStocks(): Promise<Stock[]> {
    return this.db.select().from(stocks);
  }

  async getStock(id: number): Promise<Stock | undefined> {
    const result = await this.db.select().from(stocks).where(eq(stocks.id, id));
    return result[0];
  }

  async getStocksByAccount(accountId: number): Promise<Stock[]> {
    return this.db.select().from(stocks).where(eq(stocks.accountId, accountId));
  }

  async createStock(data: InsertStock): Promise<Stock> {
    const result = await this.db.insert(stocks).values(data).returning();
    return result[0];
  }

  async updateStock(id: number, data: Partial<InsertStock>): Promise<Stock | undefined> {
    const result = await this.db.update(stocks).set(data).where(eq(stocks.id, id)).returning();
    return result[0];
  }

  async deleteStock(id: number): Promise<boolean> {
    const result = await this.db.delete(stocks).where(eq(stocks.id, id)).returning({ id: stocks.id });
    return result.length > 0;
  }

  async updateStockPrice(id: number, newPrice: string): Promise<Stock | undefined> {
    const result = await this.db
      .update(stocks)
      .set({ currentPrice: newPrice })
      .where(eq(stocks.id, id))
      .returning();
    return result[0];
  }

  async getAccountStockValue(accountId: number): Promise<number> {
    const accountStocks = await this.getStocksByAccount(accountId);
    return accountStocks.reduce(
      (sum, stock) => sum + parseFloat(stock.shares) * parseFloat(stock.currentPrice),
      0,
    );
  }
}

export const storage = new PostgresStorage();
