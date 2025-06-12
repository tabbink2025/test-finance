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
  type InsertStock
} from "@shared/schema";
import { PgStorage } from "./pg-storage";

export interface IStorage {
  // Accounts
  getAccounts(): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<boolean>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByAccount(accountId: number): Promise<Transaction[]>;
  getTransactionsByCategory(categoryId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;

  // Goals
  getGoals(): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  getGoalsByAccount(accountId: number): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;

  // Budgets
  getBudgets(): Promise<Budget[]>;
  getBudget(id: number): Promise<Budget | undefined>;
  getBudgetsByAccount(accountId: number): Promise<Budget[]>;
  getBudgetsByCategory(categoryId: number): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;
  getBudgetSpending(budgetId: number): Promise<number>;

  // Stocks
  getStocks(): Promise<Stock[]>;
  getStock(id: number): Promise<Stock | undefined>;
  getStocksByAccount(accountId: number): Promise<Stock[]>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStock(id: number, stock: Partial<InsertStock>): Promise<Stock | undefined>;
  deleteStock(id: number): Promise<boolean>;
  updateStockPrice(id: number, newPrice: string): Promise<Stock | undefined>;
  getAccountStockValue(accountId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private accounts: Map<number, Account>;
  private categories: Map<number, Category>;
  private transactions: Map<number, Transaction>;
  private goals: Map<number, Goal>;
  private budgets: Map<number, Budget>;
  private stocks: Map<number, Stock>;
  private currentAccountId: number;
  private currentCategoryId: number;
  private currentTransactionId: number;
  private currentGoalId: number;
  private currentBudgetId: number;
  private currentStockId: number;

  constructor() {
    this.accounts = new Map();
    this.categories = new Map();
    this.transactions = new Map();
    this.goals = new Map();
    this.budgets = new Map();
    this.stocks = new Map();
    this.currentAccountId = 1;
    this.currentCategoryId = 1;
    this.currentTransactionId = 1;
    this.currentGoalId = 1;
    this.currentBudgetId = 1;
    this.currentStockId = 1;
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Default accounts
    const defaultAccounts = [
      { name: "Checking Account", type: "checking", balance: "4250.32", color: "#2563EB", isActive: true },
      { name: "Savings Account", type: "savings", balance: "8597.00", color: "#059669", isActive: true },
      { name: "Credit Card", type: "credit", balance: "-347.89", color: "#DC2626", isActive: true },
      { name: "Fidelity 401k", type: "investment", balance: "0.00", color: "#7C3AED", isActive: true },
      { name: "Robinhood", type: "investment", balance: "0.00", color: "#F59E0B", isActive: true },
    ];

    defaultAccounts.forEach(account => {
      const id = this.currentAccountId++;
      this.accounts.set(id, { ...account, id });
    });

    // Default categories
    const defaultCategories = [
      { name: "Food & Dining", type: "expense", color: "#DC2626", parentId: null },
      { name: "Transportation", type: "expense", color: "#D97706", parentId: null },
      { name: "Utilities", type: "expense", color: "#2563EB", parentId: null },
      { name: "Entertainment", type: "expense", color: "#7C3AED", parentId: null },
      { name: "Salary", type: "income", color: "#059669", parentId: null },
      { name: "Freelance", type: "income", color: "#10B981", parentId: null },
    ];

    defaultCategories.forEach(category => {
      const id = this.currentCategoryId++;
      this.categories.set(id, { ...category, id });
    });

    // Add subcategories after main categories are created
    const defaultSubcategories = [
      // Food & Dining subcategories
      { name: "Groceries", type: "expense", color: "#DC2626", parentId: 1 },
      { name: "Restaurants", type: "expense", color: "#EF4444", parentId: 1 },
      { name: "Coffee & Snacks", type: "expense", color: "#F87171", parentId: 1 },
      
      // Transportation subcategories
      { name: "Gas", type: "expense", color: "#B45309", parentId: 2 },
      { name: "Public Transit", type: "expense", color: "#D97706", parentId: 2 },
      { name: "Car Maintenance", type: "expense", color: "#F59E0B", parentId: 2 },
      
      // Utilities subcategories
      { name: "Electricity", type: "expense", color: "#1D4ED8", parentId: 3 },
      { name: "Water", type: "expense", color: "#2563EB", parentId: 3 },
      { name: "Internet", type: "expense", color: "#3B82F6", parentId: 3 },
      
      // Entertainment subcategories
      { name: "Movies & Shows", type: "expense", color: "#6D28D9", parentId: 4 },
      { name: "Games", type: "expense", color: "#7C3AED", parentId: 4 },
      { name: "Sports", type: "expense", color: "#8B5CF6", parentId: 4 },
    ];

    defaultSubcategories.forEach(subcategory => {
      const id = this.currentCategoryId++;
      this.categories.set(id, { ...subcategory, id });
    });

    // Default goals
    const defaultGoals = [
      { 
        name: "Emergency Fund", 
        targetAmount: "10000.00", 
        currentAmount: "5200.00", 
        deadline: "2024-12-31", 
        accountId: 2, 
        description: "Build emergency fund",
        isCompleted: false 
      },
      { 
        name: "Vacation Fund", 
        targetAmount: "3500.00", 
        currentAmount: "1850.00", 
        deadline: "2024-06-30", 
        accountId: 2, 
        description: "Save for summer vacation",
        isCompleted: false 
      },
    ];

    defaultGoals.forEach(goal => {
      const id = this.currentGoalId++;
      this.goals.set(id, { ...goal, id });
    });

    // Default budgets
    const defaultBudgets = [
      {
        name: "Monthly Groceries",
        description: "Monthly grocery budget",
        amount: "600.00",
        period: "monthly",
        accountId: 1,
        categoryId: 1,
        isActive: true,
        alertThreshold: "0.80"
      },
      {
        name: "Dining Out",
        description: "Monthly restaurant budget",
        amount: "200.00",
        period: "monthly",
        accountId: 1,
        categoryId: 2,
        isActive: true,
        alertThreshold: "0.85"
      },
      {
        name: "Transportation",
        description: "Monthly transport costs",
        amount: "300.00",
        period: "monthly",
        accountId: 1,
        categoryId: 3,
        isActive: true,
        alertThreshold: "0.75"
      },
    ];

    defaultBudgets.forEach(budget => {
      const id = this.currentBudgetId++;
      this.budgets.set(id, { 
        ...budget, 
        id,
        createdAt: new Date()
      });
    });

    // Add sample transactions for current month to demonstrate budget tracking
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const sampleTransactions = [
      // Grocery transactions (Food & Dining category id: 1)
      {
        description: "Grocery Store - Weekly Shopping",
        amount: "124.50",
        type: "expense",
        date: new Date(currentYear, currentMonth, 3).toISOString().split('T')[0],
        accountId: 1,
        categoryId: 1,
        notes: "Weekly groceries"
      },
      {
        description: "Farmer's Market",
        amount: "45.20",
        type: "expense", 
        date: new Date(currentYear, currentMonth, 8).toISOString().split('T')[0],
        accountId: 1,
        categoryId: 1,
        notes: "Fresh produce"
      },
      {
        description: "Grocery Store - Mid-week shopping",
        amount: "87.30",
        type: "expense",
        date: new Date(currentYear, currentMonth, 15).toISOString().split('T')[0],
        accountId: 1,
        categoryId: 1,
        notes: "Additional groceries"
      },
      // Restaurant transactions (Transportation category id: 2)
      {
        description: "Italian Restaurant",
        amount: "75.40",
        type: "expense",
        date: new Date(currentYear, currentMonth, 5).toISOString().split('T')[0],
        accountId: 1,
        categoryId: 2,
        notes: "Dinner out"
      },
      {
        description: "Coffee Shop",
        amount: "12.80",
        type: "expense",
        date: new Date(currentYear, currentMonth, 10).toISOString().split('T')[0],
        accountId: 1,
        categoryId: 2,
        notes: "Morning coffee"
      },
      // Transportation expenses (Utilities category id: 3)
      {
        description: "Gas Station",
        amount: "52.00",
        type: "expense",
        date: new Date(currentYear, currentMonth, 7).toISOString().split('T')[0],
        accountId: 1,
        categoryId: 3,
        notes: "Fill up tank"
      },
      {
        description: "Metro Card",
        amount: "35.00",
        type: "expense",
        date: new Date(currentYear, currentMonth, 12).toISOString().split('T')[0],
        accountId: 1,
        categoryId: 3,
        notes: "Monthly transit pass"
      },
      // Income transaction
      {
        description: "Salary Deposit",
        amount: "3200.00",
        type: "income",
        date: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
        accountId: 1,
        categoryId: 5,
        notes: "Monthly salary"
      }
    ];

    sampleTransactions.forEach(transaction => {
      const id = this.currentTransactionId++;
      this.transactions.set(id, {
        ...transaction,
        id,
        createdAt: new Date()
      });
    });

    // Add sample stocks for investment accounts
    const sampleStocks = [
      // Fidelity 401k stocks (account id: 4)
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        shares: "10.5000",
        purchasePrice: "150.25",
        currentPrice: "175.80",
        accountId: 4,
        purchaseDate: new Date(2024, 0, 15).toISOString().split('T')[0],
        notes: "Tech portfolio allocation"
      },
      {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        shares: "8.2500",
        purchasePrice: "380.00",
        currentPrice: "420.50",
        accountId: 4,
        purchaseDate: new Date(2024, 1, 20).toISOString().split('T')[0],
        notes: "Blue chip holding"
      },
      {
        symbol: "VOO",
        name: "Vanguard S&P 500 ETF",
        shares: "15.0000",
        purchasePrice: "400.00",
        currentPrice: "435.25",
        accountId: 4,
        purchaseDate: new Date(2024, 2, 10).toISOString().split('T')[0],
        notes: "Index fund exposure"
      },
      // Robinhood stocks (account id: 5)
      {
        symbol: "TSLA",
        name: "Tesla Inc.",
        shares: "3.2500",
        purchasePrice: "240.00",
        currentPrice: "185.50",
        accountId: 5,
        purchaseDate: new Date(2024, 3, 5).toISOString().split('T')[0],
        notes: "Growth stock bet"
      },
      {
        symbol: "NVDA",
        name: "NVIDIA Corporation",
        shares: "2.7500",
        purchasePrice: "450.00",
        currentPrice: "875.00",
        accountId: 5,
        purchaseDate: new Date(2024, 4, 12).toISOString().split('T')[0],
        notes: "AI/GPU play"
      },
      {
        symbol: "AMD",
        name: "Advanced Micro Devices",
        shares: "12.0000",
        purchasePrice: "95.00",
        currentPrice: "140.75",
        accountId: 5,
        purchaseDate: new Date(2024, 5, 8).toISOString().split('T')[0],
        notes: "Semiconductor exposure"
      }
    ];

    sampleStocks.forEach(stock => {
      const id = this.currentStockId++;
      this.stocks.set(id, {
        ...stock,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  }

  // Account methods
  async getAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = this.currentAccountId++;
    const account: Account = {
      id,
      name: insertAccount.name,
      type: insertAccount.type,
      balance: insertAccount.balance ?? "0",
      color: insertAccount.color ?? "#2563EB",
      isActive: insertAccount.isActive ?? true,
    };
    this.accounts.set(id, account);
    return account;
  }

  async updateAccount(id: number, updateData: Partial<InsertAccount>): Promise<Account | undefined> {
    const account = this.accounts.get(id);
    if (!account) return undefined;
    
    const updatedAccount = { ...account, ...updateData };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteAccount(id: number): Promise<boolean> {
    return this.accounts.delete(id);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { 
      ...insertCategory, 
      id,
      color: insertCategory.color ?? "#059669",
      parentId: insertCategory.parentId ?? null,
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...updateData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Transaction methods
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByAccount(accountId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.accountId === accountId);
  }

  async getTransactionsByCategory(categoryId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.categoryId === categoryId);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      categoryId: insertTransaction.categoryId ?? null,
      notes: insertTransaction.notes ?? null,
      createdAt: new Date()
    };
    this.transactions.set(id, transaction);
    
    // Update account balance
    const account = this.accounts.get(insertTransaction.accountId);
    if (account) {
      const currentBalance = parseFloat(account.balance);
      const transactionAmount = parseFloat(insertTransaction.amount);
      const newBalance = insertTransaction.type === 'income' 
        ? currentBalance + transactionAmount 
        : currentBalance - transactionAmount;
      
      this.accounts.set(insertTransaction.accountId, {
        ...account,
        balance: newBalance.toFixed(2)
      });
    }
    
    return transaction;
  }

  async updateTransaction(id: number, updateData: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { ...transaction, ...updateData };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const transaction = this.transactions.get(id);
    if (!transaction) return false;
    
    // Reverse account balance change
    const account = this.accounts.get(transaction.accountId);
    if (account) {
      const currentBalance = parseFloat(account.balance);
      const transactionAmount = parseFloat(transaction.amount);
      const newBalance = transaction.type === 'income' 
        ? currentBalance - transactionAmount 
        : currentBalance + transactionAmount;
      
      this.accounts.set(transaction.accountId, {
        ...account,
        balance: newBalance.toFixed(2)
      });
    }
    
    return this.transactions.delete(id);
  }

  // Goal methods
  async getGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values());
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async getGoalsByAccount(accountId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(g => g.accountId === accountId);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.currentGoalId++;
    const goal: Goal = { 
      ...insertGoal, 
      id,
      description: insertGoal.description ?? null,
      currentAmount: insertGoal.currentAmount ?? "0",
      deadline: insertGoal.deadline ?? null,
      isCompleted: insertGoal.isCompleted ?? false,
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: number, updateData: Partial<InsertGoal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...updateData };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Budget methods
  async getBudgets(): Promise<Budget[]> {
    return Array.from(this.budgets.values());
  }

  async getBudget(id: number): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }

  async getBudgetsByAccount(accountId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(b => b.accountId === accountId);
  }

  async getBudgetsByCategory(categoryId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(b => b.categoryId === categoryId);
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = this.currentBudgetId++;
    const budget: Budget = { 
      ...insertBudget, 
      id,
      description: insertBudget.description ?? null,
      isActive: insertBudget.isActive ?? true,
      accountId: insertBudget.accountId ?? null,
      categoryId: insertBudget.categoryId ?? null,
      period: insertBudget.period ?? "monthly",
      alertThreshold: insertBudget.alertThreshold ?? null,
      createdAt: new Date()
    };
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: number, updateData: Partial<InsertBudget>): Promise<Budget | undefined> {
    const budget = this.budgets.get(id);
    if (!budget) return undefined;
    
    const updatedBudget = { ...budget, ...updateData };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }

  async deleteBudget(id: number): Promise<boolean> {
    return this.budgets.delete(id);
  }

  async getBudgetSpending(budgetId: number): Promise<number> {
    const budget = this.budgets.get(budgetId);
    if (!budget) return 0;

    const now = new Date();
    let startDate: Date;
    
    // Calculate the start date based on budget period
    switch (budget.period) {
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay()); // Start of current week
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1); // Start of current year
        break;
      case 'monthly':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
        break;
    }

    // Filter transactions within the budget period
    let totalSpent = 0;
    for (const transaction of this.transactions.values()) {
      const transactionDate = new Date(transaction.date);
      
      // Check if transaction is within the current period
      if (transactionDate >= startDate && transactionDate <= now) {
        // Check if transaction matches budget criteria
        const matchesAccount = !budget.accountId || transaction.accountId === budget.accountId;
        const matchesCategory = !budget.categoryId || transaction.categoryId === budget.categoryId;
        
        // Only count expense transactions for budget calculations
        if (transaction.type === 'expense' && matchesAccount && matchesCategory) {
          totalSpent += parseFloat(transaction.amount);
        }
      }
    }

    return totalSpent;
  }

  // Stock methods
  async getStocks(): Promise<Stock[]> {
    return Array.from(this.stocks.values());
  }

  async getStock(id: number): Promise<Stock | undefined> {
    return this.stocks.get(id);
  }

  async getStocksByAccount(accountId: number): Promise<Stock[]> {
    return Array.from(this.stocks.values()).filter(stock => stock.accountId === accountId);
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    const id = this.currentStockId++;
    const stock: Stock = {
      ...insertStock,
      notes: insertStock.notes ?? null,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.stocks.set(id, stock);
    
    // Update the investment account balance
    await this.updateAccountBalance(insertStock.accountId);
    return stock;
  }

  async updateStock(id: number, updateData: Partial<InsertStock>): Promise<Stock | undefined> {
    const stock = this.stocks.get(id);
    if (!stock) return undefined;
    
    const updatedStock = { 
      ...stock, 
      ...updateData,
      updatedAt: new Date()
    };
    this.stocks.set(id, updatedStock);
    
    // Update the investment account balance
    await this.updateAccountBalance(stock.accountId);
    return updatedStock;
  }

  async deleteStock(id: number): Promise<boolean> {
    const stock = this.stocks.get(id);
    if (!stock) return false;
    
    const deleted = this.stocks.delete(id);
    if (deleted) {
      // Update the investment account balance
      await this.updateAccountBalance(stock.accountId);
    }
    return deleted;
  }

  async updateStockPrice(id: number, newPrice: string): Promise<Stock | undefined> {
    const stock = this.stocks.get(id);
    if (!stock) return undefined;
    
    const updatedStock = {
      ...stock,
      currentPrice: newPrice,
      updatedAt: new Date()
    };
    this.stocks.set(id, updatedStock);
    
    // Update the investment account balance
    await this.updateAccountBalance(stock.accountId);
    return updatedStock;
  }

  async getAccountStockValue(accountId: number): Promise<number> {
    const accountStocks = await this.getStocksByAccount(accountId);
    let totalValue = 0;
    
    for (const stock of accountStocks) {
      const currentValue = parseFloat(stock.shares) * parseFloat(stock.currentPrice);
      totalValue += currentValue;
    }
    
    return totalValue;
  }

  private async updateAccountBalance(accountId: number): Promise<void> {
    const stockValue = await this.getAccountStockValue(accountId);
    const account = this.accounts.get(accountId);
    
    if (account) {
      const updatedAccount = {
        ...account,
        balance: stockValue.toFixed(2)
      };
      this.accounts.set(accountId, updatedAccount);
    }
  }
}

export const storage = process.env.DATABASE_URL ? new PgStorage() : new MemStorage();
