import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon } from "lucide-react";
import type { Transaction, Account, Category } from "@shared/schema";

export default function Reports() {
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const reportData = useMemo(() => {
    if (transactionsLoading || transactions.length === 0) {
      return {
        monthlyData: [],
        categoryData: [],
        accountData: [],
        totalIncome: 0,
        totalExpenses: 0,
        netFlow: 0,
        topCategories: [],
      };
    }

    // Calculate monthly data for the last 6 months
    const monthlyData = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === date.getMonth() && 
               transactionDate.getFullYear() === date.getFullYear();
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      monthlyData.push({
        month: monthName,
        income,
        expenses,
        net: income - expenses,
      });
    }

    // Calculate category spending
    const categorySpending = new Map<number, number>();
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    expenseTransactions.forEach(transaction => {
      if (transaction.categoryId) {
        const current = categorySpending.get(transaction.categoryId) || 0;
        categorySpending.set(transaction.categoryId, current + parseFloat(transaction.amount));
      }
    });

    const categoryData = Array.from(categorySpending.entries())
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          name: category?.name || 'Unknown',
          value: amount,
          color: category?.color || '#6B7280',
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories

    // Calculate account balances
    const accountData = accounts.map(account => ({
      name: account.name,
      balance: parseFloat(account.balance),
      type: account.type,
      color: account.color,
    }));

    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const netFlow = totalIncome - totalExpenses;

    // Top spending categories
    const topCategories = categoryData.slice(0, 5);

    return {
      monthlyData,
      categoryData,
      accountData,
      totalIncome,
      totalExpenses,
      netFlow,
      topCategories,
    };
  }, [transactions, accounts, categories, transactionsLoading]);

  if (transactionsLoading) {
    return <div>Loading...</div>;
  }

  const COLORS = ['#2563EB', '#059669', '#DC2626', '#D97706', '#7C3AED', '#0891B2', '#65A30D', '#C2410C'];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Financial Reports</h1>
        <p className="text-gray-600">Analyze your financial patterns and trends</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-secondary">{formatCurrency(reportData.totalIncome)}</p>
              </div>
              <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-danger">{formatCurrency(reportData.totalExpenses)}</p>
              </div>
              <div className="w-12 h-12 bg-danger bg-opacity-10 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-danger" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Flow</p>
                <p className={`text-2xl font-bold ${reportData.netFlow >= 0 ? 'text-secondary' : 'text-danger'}`}>
                  {formatCurrency(Math.abs(reportData.netFlow))}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant={reportData.netFlow >= 0 ? "default" : "destructive"}>
                {reportData.netFlow >= 0 ? "Positive" : "Negative"} Flow
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                <p className="text-2xl font-bold text-warning">
                  {reportData.totalIncome > 0 
                    ? Math.round((reportData.netFlow / reportData.totalIncome) * 100)
                    : 0
                  }%
                </p>
              </div>
              <div className="w-12 h-12 bg-warning bg-opacity-10 rounded-lg flex items-center justify-center">
                <PieChartIcon className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Income vs Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    tickFormatter={(value) => {
                      if (Math.abs(value) >= 1000) {
                        return `$${(value / 1000).toFixed(1)}k`;
                      }
                      return formatCurrency(value);
                    }}
                    domain={[0, 'dataMax + 100']}
                    allowDataOverflow={false}
                  />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="income" fill="#059669" name="Income" />
                  <Bar dataKey="expenses" fill="#DC2626" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available for chart
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spending by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reportData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No spending data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Net Flow Trend */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Net Flow Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {reportData.monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => {
                    if (Math.abs(value) >= 1000) {
                      return `$${(value / 1000).toFixed(1)}k`;
                    }
                    return formatCurrency(value);
                  }}
                  domain={['dataMin - 100', 'dataMax + 100']}
                  allowDataOverflow={false}
                />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Line 
                  type="monotone" 
                  dataKey="net" 
                  stroke="#2563EB" 
                  strokeWidth={3}
                  name="Net Flow"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available for trend analysis
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Spending Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.topCategories.length > 0 ? (
              <div className="space-y-4">
                {reportData.topCategories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-semibold text-gray-400 w-6">
                        {index + 1}
                      </div>
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(category.value)}
                      </span>
                      <div className="text-sm text-gray-500">
                        {reportData.totalExpenses > 0 
                          ? `${((category.value / reportData.totalExpenses) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No spending data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Balances */}
        <Card>
          <CardHeader>
            <CardTitle>Account Balances</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.accountData.length > 0 ? (
              <div className="space-y-4">
                {reportData.accountData
                  .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
                  .map((account) => (
                    <div key={account.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: account.color }}
                        />
                        <div>
                          <span className="font-medium text-gray-900">{account.name}</span>
                          <div className="text-sm text-gray-500 capitalize">{account.type}</div>
                        </div>
                      </div>
                      <span className={`font-semibold ${
                        account.balance >= 0 ? 'text-gray-900' : 'text-danger'
                      }`}>
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No accounts available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {transactions.length === 0 && (
        <Card className="mt-8">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data for reports</h3>
            <p className="text-gray-600">Add some transactions to see financial reports and insights</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
