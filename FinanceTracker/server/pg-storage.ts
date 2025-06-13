import { and, eq, gte, lte, sum } from "drizzle-orm";
import { db } from "./db";
import {
  accounts,
  categories,
  transactions,
  goals,
  goalAllocations,
  budgets,
  stocks,
  savingTactics,
  type Account,
  type InsertAccount,
  type Category,
  type InsertCategory,
  type Transaction,
  type InsertTransaction,
  type Goal,
  type InsertGoal,
  type GoalAllocation,
  type InsertGoalAllocation,
  type Budget,
  type InsertBudget,
  type Stock,
  type InsertStock,
  type SavingTactic,
  type InsertSavingTactic,
} from "@shared/schema";
import type { IStorage } from "./storage";

export class PgStorage implements IStorage {
  async getAccounts(): Promise<Account[]> {
    return db.select().from(accounts);
  }

  async getAccount(id: number): Promise<Account | undefined> {
    const rows = await db.select().from(accounts).where(eq(accounts.id, id));
    return rows[0];
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const rows = await db.insert(accounts).values(account).returning();
    return rows[0];
  }

  async updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined> {
    const rows = await db.update(accounts).set(account).where(eq(accounts.id, id)).returning();
    return rows[0];
  }

  async deleteAccount(id: number): Promise<boolean> {
    const rows = await db.delete(accounts).where(eq(accounts.id, id)).returning({ id: accounts.id });
    return rows.length > 0;
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const rows = await db.select().from(categories).where(eq(categories.id, id));
    return rows[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const rows = await db.insert(categories).values(category).returning();
    return rows[0];
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const rows = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return rows[0];
  }

  async deleteCategory(id: number): Promise<boolean> {
    const rows = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
    return rows.length > 0;
  }

  async getTransactions(): Promise<Transaction[]> {
    return db.select().from(transactions);
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const rows = await db.select().from(transactions).where(eq(transactions.id, id));
    return rows[0];
  }

  async getTransactionsByAccount(accountId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.accountId, accountId));
  }

  async getTransactionsByCategory(categoryId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.categoryId, categoryId));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const rows = await db.insert(transactions).values(transaction).returning();
    await this.updateAccountBalance(transaction.accountId);
    return rows[0];
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const rows = await db.update(transactions).set(transaction).where(eq(transactions.id, id)).returning();
    if (rows[0]) {
      await this.updateAccountBalance(rows[0].accountId);
    }
    return rows[0];
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const rows = await db.delete(transactions).where(eq(transactions.id, id)).returning();
    if (rows[0]) {
      await this.updateAccountBalance(rows[0].accountId);
    }
    return rows.length > 0;
  }

  async getGoals(): Promise<Goal[]> {
    return db.select().from(goals);
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    const rows = await db.select().from(goals).where(eq(goals.id, id));
    return rows[0];
  }

  async getGoalsByAccount(accountId: number): Promise<Goal[]> {
    return db.select().from(goals).where(eq(goals.accountId, accountId));
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const rows = await db.insert(goals).values(goal).returning();
    return rows[0];
  }

  async updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined> {
    const rows = await db.update(goals).set(goal).where(eq(goals.id, id)).returning();
    return rows[0];
  }

  async deleteGoal(id: number): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getBudgets(): Promise<Budget[]> {
    return db.select().from(budgets);
  }

  async getBudget(id: number): Promise<Budget | undefined> {
    const rows = await db.select().from(budgets).where(eq(budgets.id, id));
    return rows[0];
  }

  async getBudgetsByAccount(accountId: number): Promise<Budget[]> {
    return db.select().from(budgets).where(eq(budgets.accountId, accountId));
  }

  async getBudgetsByCategory(categoryId: number): Promise<Budget[]> {
    return db.select().from(budgets).where(eq(budgets.categoryId, categoryId));
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const rows = await db.insert(budgets).values(budget).returning();
    return rows[0];
  }

  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const rows = await db.update(budgets).set(budget).where(eq(budgets.id, id)).returning();
    return rows[0];
  }

  async deleteBudget(id: number): Promise<boolean> {
    const rows = await db.delete(budgets).where(eq(budgets.id, id)).returning({ id: budgets.id });
    return rows.length > 0;
  }

  async getBudgetSpending(budgetId: number): Promise<number> {
    const budgetRows = await db.select().from(budgets).where(eq(budgets.id, budgetId));
    const budget = budgetRows[0];
    if (!budget) return 0;

    const now = new Date();
    let startDate: Date;
    switch (budget.period) {
      case "weekly":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "monthly":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Convert dates to strings for comparison with date column
    const startDateStr = startDate.toISOString().split('T')[0];
    const nowStr = now.toISOString().split('T')[0];

    const trans = await db
      .select()
      .from(transactions)
      .where(
        and(
          gte(transactions.date, startDateStr),
          lte(transactions.date, nowStr)
        )
      );

    let totalSpent = 0;
    for (const t of trans) {
      const matchesAccount = !budget.accountId || t.accountId === budget.accountId;
      const matchesCategory = !budget.categoryId || t.categoryId === budget.categoryId;
      if (t.type === "expense" && matchesAccount && matchesCategory) {
        totalSpent += parseFloat(t.amount as unknown as string);
      }
    }
    return totalSpent;
  }

  async getStocks(): Promise<Stock[]> {
    return db.select().from(stocks);
  }

  async getStock(id: number): Promise<Stock | undefined> {
    const rows = await db.select().from(stocks).where(eq(stocks.id, id));
    return rows[0];
  }

  async getStocksByAccount(accountId: number): Promise<Stock[]> {
    return db.select().from(stocks).where(eq(stocks.accountId, accountId));
  }

  async createStock(stock: InsertStock): Promise<Stock> {
    const rows = await db.insert(stocks).values(stock).returning();
    await this.updateAccountBalance(stock.accountId);
    return rows[0];
  }

  async updateStock(id: number, stock: Partial<InsertStock>): Promise<Stock | undefined> {
    const rows = await db.update(stocks).set(stock).where(eq(stocks.id, id)).returning();
    if (rows[0]) {
      await this.updateAccountBalance(rows[0].accountId);
    }
    return rows[0];
  }

  async deleteStock(id: number): Promise<boolean> {
    const rows = await db.delete(stocks).where(eq(stocks.id, id)).returning();
    if (rows[0]) {
      await this.updateAccountBalance(rows[0].accountId);
    }
    return rows.length > 0;
  }

  async updateStockPrice(id: number, newPrice: string): Promise<Stock | undefined> {
    const rows = await db
      .update(stocks)
      .set({ currentPrice: newPrice })
      .where(eq(stocks.id, id))
      .returning();
    if (rows[0]) {
      await this.updateAccountBalance(rows[0].accountId);
    }
    return rows[0];
  }

  async getAccountStockValue(accountId: number): Promise<number> {
    const accountStocks = await this.getStocksByAccount(accountId);
    let totalValue = 0;
    for (const stock of accountStocks) {
      totalValue += parseFloat(stock.shares as unknown as string) * parseFloat(stock.currentPrice as unknown as string);
    }
    return totalValue;
  }

  private async updateAccountBalance(accountId: number): Promise<void> {
    // Get the initial balance from the account
    const accountRows = await db.select().from(accounts).where(eq(accounts.id, accountId));
    const account = accountRows[0];
    if (!account) return;

    // Use initialBalance as the base, defaulting to 0 if null/undefined
    let balance = parseFloat(account.initialBalance as unknown as string) || 0;

    // Get all transactions for this account
    const trans = await db.select().from(transactions).where(eq(transactions.accountId, accountId));

    // Sum all transactions
    for (const t of trans) {
      const amount = parseFloat(t.amount as unknown as string);
      if (t.type === "income") {
        balance += amount;
      } else if (t.type === "expense") {
        balance -= amount;
      } else if (t.type === "transfer") {
        // For transfer, treat as expense (leaving this account)
        balance -= amount;
      }
    }

    // Optionally add stock value for investment accounts
    let stockValue = 0;
    if (account.type === "investment") {
      stockValue = await this.getAccountStockValue(accountId);
      balance += stockValue;
    }

    await db
      .update(accounts)
      .set({ balance: balance.toFixed(2) })
      .where(eq(accounts.id, accountId));
  }

  // Goal Allocation methods
  async getGoalAllocations(): Promise<GoalAllocation[]> {
    return db.select().from(goalAllocations);
  }

  async getGoalAllocationsByGoal(goalId: number): Promise<GoalAllocation[]> {
    return db.select().from(goalAllocations).where(eq(goalAllocations.goalId, goalId));
  }

  async createGoalAllocation(allocation: InsertGoalAllocation): Promise<GoalAllocation> {
    const rows = await db.insert(goalAllocations).values(allocation).returning();
    return rows[0];
  }

  async updateGoalAllocation(id: number, allocation: Partial<InsertGoalAllocation>): Promise<GoalAllocation | undefined> {
    const rows = await db.update(goalAllocations).set(allocation).where(eq(goalAllocations.id, id)).returning();
    return rows[0];
  }

  async deleteGoalAllocation(id: number): Promise<boolean> {
    const result = await db.delete(goalAllocations).where(eq(goalAllocations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getGoalCurrentAmount(goalId: number): Promise<number> {
    const result = await db
      .select({ totalAmount: sum(goalAllocations.amount) })
      .from(goalAllocations)
      .where(eq(goalAllocations.goalId, goalId));
    
    return parseFloat(result[0]?.totalAmount || "0");
  }

  // Saving Tactics methods
  async getSavingTactics(): Promise<SavingTactic[]> {
    return db.select().from(savingTactics).where(eq(savingTactics.isActive, true));
  }

  async getSavingTactic(id: number): Promise<SavingTactic | undefined> {
    const rows = await db.select().from(savingTactics).where(eq(savingTactics.id, id));
    return rows[0];
  }

  async getSavingTacticsByCategory(category: string): Promise<SavingTactic[]> {
    return db.select().from(savingTactics).where(
      and(eq(savingTactics.category, category), eq(savingTactics.isActive, true))
    );
  }

  async getPersonalSavingTactics(): Promise<SavingTactic[]> {
    return db.select().from(savingTactics).where(
      and(eq(savingTactics.isPersonal, true), eq(savingTactics.isActive, true))
    );
  }

  async createSavingTactic(tactic: InsertSavingTactic): Promise<SavingTactic> {
    const rows = await db.insert(savingTactics).values(tactic).returning();
    return rows[0];
  }

  async updateSavingTactic(id: number, tactic: Partial<InsertSavingTactic>): Promise<SavingTactic | undefined> {
    const rows = await db.update(savingTactics).set(tactic).where(eq(savingTactics.id, id)).returning();
    return rows[0];
  }

  async deleteSavingTactic(id: number): Promise<boolean> {
    const result = await db.delete(savingTactics).where(eq(savingTactics.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}
