import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertAccountSchema,
  insertCategorySchema,
  insertTransactionSchema,
  insertGoalSchema,
  insertGoalAllocationSchema,
  insertBudgetSchema,
  insertStockSchema,
  insertSavingTacticSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Account routes
  app.get("/api/accounts", async (req, res) => {
    try {
      const accounts = await storage.getAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.get("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid account id" });
      }
      const account = await storage.getAccount(id);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch account" });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const accountData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid account data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.put("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid account id" });
      }
      const updateData = insertAccountSchema.partial().parse(req.body);
      const account = await storage.updateAccount(id, updateData);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid account data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update account" });
    }
  });

  app.delete("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid account id" });
      }
      const deleted = await storage.deleteAccount(id);
      if (!deleted) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid category id" });
      }
      const updateData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, updateData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid category id" });
      }
      const deleted = await storage.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/account/:accountId", async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      if (Number.isNaN(accountId)) {
        return res.status(400).json({ message: "Invalid account id" });
      }
      const transactions = await storage.getTransactionsByAccount(accountId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid transaction id" });
      }
      const updateData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(id, updateData);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid transaction id" });
      }
      const deleted = await storage.deleteTransaction(id);
      if (!deleted) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Goal routes
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getGoals();
      res.json(goals);
    } catch (error) {
      console.error("Get goals error:", error);
      res.status(500).json({ 
        message: "Failed to fetch goals", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.get("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid goal id" });
      }
      const goal = await storage.getGoal(id);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      console.error("Get goal error:", error);
      res.status(500).json({ 
        message: "Failed to fetch goal", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      console.log("Received goal data:", req.body);
      const goalData = insertGoalSchema.parse(req.body);
      console.log("Parsed goal data:", goalData);
      const goal = await storage.createGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      console.error("Goal creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ 
        message: "Failed to create goal", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.put("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid goal id" });
      }
      const updateData = insertGoalSchema.partial().parse(req.body);
      const goal = await storage.updateGoal(id, updateData);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid goal id" });
      }
      const deleted = await storage.deleteGoal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Goal Allocation routes
  app.get("/api/goal-allocations", async (req, res) => {
    try {
      const allocations = await storage.getGoalAllocations();
      res.json(allocations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goal allocations" });
    }
  });

  app.get("/api/goals/:goalId/allocations", async (req, res) => {
    try {
      const goalId = parseInt(req.params.goalId);
      if (Number.isNaN(goalId)) {
        return res.status(400).json({ message: "Invalid goal id" });
      }
      const allocations = await storage.getGoalAllocationsByGoal(goalId);
      res.json(allocations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goal allocations" });
    }
  });

  app.post("/api/goal-allocations", async (req, res) => {
    try {
      const allocationData = insertGoalAllocationSchema.parse(req.body);
      
      // Validate allocation against account balance
      const goal = await storage.getGoal(allocationData.goalId);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      const account = await storage.getAccount(goal.accountId);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Get all goals for this account
      const allGoals = await storage.getGoals();
      const accountGoals = allGoals.filter(g => g.accountId === goal.accountId);
      const accountGoalIds = accountGoals.map(g => g.id);
      
      // Calculate total allocated for this account
      const allAllocations = await storage.getGoalAllocations();
      const totalAllocated = allAllocations
        .filter(alloc => accountGoalIds.includes(alloc.goalId))
        .reduce((sum, alloc) => sum + parseFloat(alloc.amount), 0);
      
      const allocationAmount = parseFloat(allocationData.amount);
      const accountBalance = parseFloat(account.balance);
      
      if (totalAllocated + allocationAmount > accountBalance) {
        return res.status(400).json({ 
          message: `Allocation would exceed account balance. Available: $${(accountBalance - totalAllocated).toFixed(2)}, Requested: $${allocationAmount.toFixed(2)}` 
        });
      }
      
      const allocation = await storage.createGoalAllocation(allocationData);
      res.status(201).json(allocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid allocation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create goal allocation" });
    }
  });

  app.put("/api/goal-allocations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid allocation id" });
      }
      const updateData = insertGoalAllocationSchema.partial().parse(req.body);
      
      // Get the existing allocation
      const existingAllocations = await storage.getGoalAllocations();
      const existingAllocation = existingAllocations.find(a => a.id === id);
      if (!existingAllocation) {
        return res.status(404).json({ message: "Goal allocation not found" });
      }
      
      // If amount is being updated, validate against account balance
      if (updateData.amount) {
        const goal = await storage.getGoal(existingAllocation.goalId);
        if (!goal) {
          return res.status(404).json({ message: "Goal not found" });
        }
        
        const account = await storage.getAccount(goal.accountId);
        if (!account) {
          return res.status(404).json({ message: "Account not found" });
        }
        
        // Get all goals for this account
        const allGoals = await storage.getGoals();
        const accountGoals = allGoals.filter(g => g.accountId === goal.accountId);
        const accountGoalIds = accountGoals.map(g => g.id);
        
        // Calculate total allocated for this account (excluding the current allocation being updated)
        const allAllocations = await storage.getGoalAllocations();
        const totalAllocated = allAllocations
          .filter(alloc => accountGoalIds.includes(alloc.goalId) && alloc.id !== id)
          .reduce((sum, alloc) => sum + parseFloat(alloc.amount), 0);
        
        const newAllocationAmount = parseFloat(updateData.amount);
        const accountBalance = parseFloat(account.balance);
        
        if (totalAllocated + newAllocationAmount > accountBalance) {
          const currentAllocationAmount = parseFloat(existingAllocation.amount);
          const available = accountBalance - totalAllocated;
          return res.status(400).json({ 
            message: `Updated allocation would exceed account balance. Available: $${available.toFixed(2)}, Requested: $${newAllocationAmount.toFixed(2)}` 
          });
        }
      }
      
      const allocation = await storage.updateGoalAllocation(id, updateData);
      if (!allocation) {
        return res.status(404).json({ message: "Goal allocation not found" });
      }
      res.json(allocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid allocation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update goal allocation" });
    }
  });

  app.delete("/api/goal-allocations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid allocation id" });
      }
      const deleted = await storage.deleteGoalAllocation(id);
      if (!deleted) {
        return res.status(404).json({ message: "Goal allocation not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal allocation" });
    }
  });

  app.get("/api/goals/:goalId/allocations", async (req, res) => {
    try {
      const goalId = parseInt(req.params.goalId);
      if (Number.isNaN(goalId)) {
        return res.status(400).json({ message: "Invalid goal id" });
      }
      const allocations = await storage.getGoalAllocationsByGoal(goalId);
      res.json(allocations);
    } catch (error) {
      console.error("Get goal allocations error:", error);
      res.status(500).json({ 
        message: "Failed to fetch goal allocations", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.get("/api/goals/:goalId/current-amount", async (req, res) => {
    try {
      const goalId = parseInt(req.params.goalId);
      if (Number.isNaN(goalId)) {
        return res.status(400).json({ message: "Invalid goal id" });
      }
      const currentAmount = await storage.getGoalCurrentAmount(goalId);
      res.json({ goalId, currentAmount });
    } catch (error) {
      res.status(500).json({ message: "Failed to get goal current amount" });
    }
  });

  // Budget routes
  app.get("/api/budgets", async (req, res) => {
    try {
      const budgets = await storage.getBudgets();
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.get("/api/budgets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid budget id" });
      }
      const budget = await storage.getBudget(id);
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      res.json(budget);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budget" });
    }
  });

  app.get("/api/budgets/account/:accountId", async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      if (Number.isNaN(accountId)) {
        return res.status(400).json({ message: "Invalid account id" });
      }
      const budgets = await storage.getBudgetsByAccount(accountId);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets by account" });
    }
  });

  app.get("/api/budgets/category/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      if (Number.isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category id" });
      }
      const budgets = await storage.getBudgetsByCategory(categoryId);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets by category" });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const budgetData = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget(budgetData);
      res.status(201).json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid budget data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  app.put("/api/budgets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid budget id" });
      }
      const updateData = insertBudgetSchema.partial().parse(req.body);
      const budget = await storage.updateBudget(id, updateData);
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      res.json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid budget data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update budget" });
    }
  });

  app.delete("/api/budgets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid budget id" });
      }
      const deleted = await storage.deleteBudget(id);
      if (!deleted) {
        return res.status(404).json({ message: "Budget not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });

  app.get("/api/budgets/:id/spending", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid budget id" });
      }
      const spending = await storage.getBudgetSpending(id);
      res.json({ budgetId: id, spending });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate budget spending" });
    }
  });

  // Stock routes
  app.get("/api/stocks", async (_req, res) => {
    try {
      const stocks = await storage.getStocks();
      res.json(stocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stocks" });
    }
  });

  app.get("/api/stocks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid stock id" });
      }
      const stock = await storage.getStock(id);
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      res.json(stock);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock" });
    }
  });

  app.get("/api/stocks/account/:accountId", async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      if (Number.isNaN(accountId)) {
        return res.status(400).json({ message: "Invalid account id" });
      }
      const stocks = await storage.getStocksByAccount(accountId);
      res.json(stocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch account stocks" });
    }
  });

  app.post("/api/stocks", async (req, res) => {
    try {
      const stockData = insertStockSchema.parse(req.body);
      const stock = await storage.createStock(stockData);
      res.status(201).json(stock);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid stock data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create stock" });
    }
  });

  app.put("/api/stocks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid stock id" });
      }
      const updateData = insertStockSchema.partial().parse(req.body);
      const stock = await storage.updateStock(id, updateData);
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      res.json(stock);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid stock data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update stock" });
    }
  });

  app.delete("/api/stocks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid stock id" });
      }
      const deleted = await storage.deleteStock(id);
      if (!deleted) {
        return res.status(404).json({ message: "Stock not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete stock" });
    }
  });

  // Saving Tactics routes
  app.get("/api/saving-tactics", async (req, res) => {
    try {
      const tactics = await storage.getSavingTactics();
      res.json(tactics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saving tactics" });
    }
  });

  app.get("/api/saving-tactics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid saving tactic id" });
      }
      const tactic = await storage.getSavingTactic(id);
      if (!tactic) {
        return res.status(404).json({ message: "Saving tactic not found" });
      }
      res.json(tactic);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saving tactic" });
    }
  });

  app.get("/api/saving-tactics/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const tactics = await storage.getSavingTacticsByCategory(category);
      res.json(tactics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saving tactics by category" });
    }
  });

  app.get("/api/saving-tactics/personal", async (req, res) => {
    try {
      const tactics = await storage.getPersonalSavingTactics();
      res.json(tactics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch personal saving tactics" });
    }
  });

  app.post("/api/saving-tactics", async (req, res) => {
    try {
      const tacticData = insertSavingTacticSchema.parse(req.body);
      const tactic = await storage.createSavingTactic(tacticData);
      res.status(201).json(tactic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid saving tactic data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create saving tactic" });
    }
  });

  app.put("/api/saving-tactics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid saving tactic id" });
      }
      const updateData = insertSavingTacticSchema.partial().parse(req.body);
      const tactic = await storage.updateSavingTactic(id, updateData);
      if (!tactic) {
        return res.status(404).json({ message: "Saving tactic not found" });
      }
      res.json(tactic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid saving tactic data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update saving tactic" });
    }
  });

  app.delete("/api/saving-tactics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid saving tactic id" });
      }
      const deleted = await storage.deleteSavingTactic(id);
      if (!deleted) {
        return res.status(404).json({ message: "Saving tactic not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete saving tactic" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
