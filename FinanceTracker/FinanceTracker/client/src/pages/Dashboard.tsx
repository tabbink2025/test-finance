import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, getAccountTypeIcon, getCategoryIcon } from "@/lib/utils";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Plus,
  ArrowUpDown,
  CreditCard,
  Receipt
} from "lucide-react";
import type { Account, Transaction, Goal, Category } from "@shared/schema";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TransactionForm from "@/components/forms/TransactionForm";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const { toast } = useToast();

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: goals = [], isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/transactions", {
        ...data,
        amount: data.amount.toString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setShowTransactionForm(false);
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
    },
  });

  if (accountsLoading || transactionsLoading || goalsLoading) {
    return <div>Loading...</div>;
  }

  // Calculate summary statistics
  const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const activeGoals = goals.filter(g => !g.isCompleted);
  const averageGoalProgress = activeGoals.length > 0 
    ? activeGoals.reduce((sum, goal) => {
        const progress = (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;
        return sum + Math.min(progress, 100);
      }, 0) / activeGoals.length
    : 0;

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const getAccountName = (accountId: number) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.name || "Unknown";
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Financial Dashboard</h1>
        <p className="text-gray-600">Overview of your financial status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBalance)}</p>
              </div>
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-secondary font-medium">Across {accounts.length} accounts</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-secondary">{formatCurrency(monthlyIncome)}</p>
              </div>
              <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-500">This month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                <p className="text-2xl font-bold text-danger">{formatCurrency(monthlyExpenses)}</p>
              </div>
              <div className="w-12 h-12 bg-danger bg-opacity-10 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-danger" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-500">This month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Savings Goals</p>
                <p className="text-2xl font-bold text-warning">{Math.round(averageGoalProgress)}%</p>
              </div>
              <div className="w-12 h-12 bg-warning bg-opacity-10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-warning" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-secondary font-medium">Average progress</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Account Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Account Balances */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Account Balances</CardTitle>
              <Button variant="ghost" size="sm">+ Add Account</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: account.color + '20' }}
                    >
                      <svg 
                        className="w-5 h-5" 
                        style={{ color: account.color }}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d={getAccountTypeIcon(account.type)}
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{account.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${parseFloat(account.balance) < 0 ? 'text-danger' : 'text-gray-900'}`}>
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No transactions yet</p>
              ) : (
                recentTransactions.map((transaction) => {
                  const category = categories.find(c => c.id === transaction.categoryId);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <svg 
                            className={`w-5 h-5 ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d={getCategoryIcon(category?.name || '')}
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {getCategoryName(transaction.categoryId)} • {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-secondary' : 'text-danger'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Savings Goals</CardTitle>
            <Button variant="ghost" size="sm">+ Add Goal</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activeGoals.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No active goals</p>
            ) : (
              activeGoals.map((goal) => {
                const progress = (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;
                return (
                  <div key={goal.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{goal.name}</h4>
                      <span className="text-sm text-gray-500">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="mb-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{Math.round(progress)}% complete</span>
                      {goal.deadline && (
                        <span className="text-gray-500">Target: {formatDate(goal.deadline)}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => setShowTransactionForm(true)}
          >
            <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium">Add Transaction</span>
          </Button>

          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
              <ArrowUpDown className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-sm font-medium">Transfer Money</span>
          </Button>

          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-warning bg-opacity-10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-warning" />
            </div>
            <span className="text-sm font-medium">Pay Bill</span>
          </Button>

          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-purple-600 bg-opacity-10 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium">Export Data</span>
          </Button>
        </div>
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm
            onSubmit={(data) => addTransactionMutation.mutate(data)}
            onCancel={() => setShowTransactionForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
