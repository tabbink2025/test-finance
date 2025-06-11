import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Edit, Trash2, Target, AlertTriangle, Calendar } from "lucide-react";
import type { Budget, Account, Category } from "@shared/schema";
import BudgetForm from "../components/forms/BudgetForm";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Budgets() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();
  const [deletingBudget, setDeletingBudget] = useState<Budget | undefined>();
  const { toast } = useToast();

  const { data: budgets = [], isLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => 
      fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      setIsFormOpen(false);
      toast({ title: "Budget created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create budget", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      fetch(`/api/budgets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      setEditingBudget(undefined);
      toast({ title: "Budget updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update budget", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/budgets/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      setDeletingBudget(undefined);
      toast({ title: "Budget deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete budget", variant: "destructive" });
    },
  });

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleDelete = (budget: Budget) => {
    setDeletingBudget(budget);
  };

  const getAccountName = (accountId: number | null) => {
    if (!accountId) return "All Accounts";
    const account = accounts.find((a) => a.id === accountId);
    return account?.name || "Unknown Account";
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "All Categories";
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown Category";
  };

  const { data: budgetSpending = {} } = useQuery({
    queryKey: ["/api/budgets/spending", budgets],
    queryFn: async () => {
      const spendingData: Record<number, number> = {};
      for (const budget of budgets) {
        const response = await fetch(`/api/budgets/${budget.id}/spending`);
        if (response.ok) {
          const data = await response.json();
          spendingData[budget.id] = data.spending;
        }
      }
      return spendingData;
    },
    enabled: budgets.length > 0,
  });

  const calculateBudgetProgress = (budget: Budget) => {
    const spent = budgetSpending[budget.id] || 0;
    const percentage = (spent / parseFloat(budget.amount)) * 100;
    return { spent, percentage: Math.min(percentage, 100) };
  };

  const getBudgetStatus = (budget: Budget, progress: { spent: number; percentage: number }) => {
    const alertThreshold = parseFloat(budget.alertThreshold || "0.80") * 100;
    
    if (progress.percentage >= 100) {
      return { status: "over", color: "bg-red-500", text: "Over Budget" };
    } else if (progress.percentage >= alertThreshold) {
      return { status: "warning", color: "bg-yellow-500", text: "Near Limit" };
    } else {
      return { status: "good", color: "bg-green-500", text: "On Track" };
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">Manage your spending limits and track budget progress</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Budget
        </Button>
      </div>

      {budgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first budget to start tracking your spending limits
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget: Budget) => {
            const progress = calculateBudgetProgress(budget);
            const status = getBudgetStatus(budget, progress);
            
            return (
              <Card key={budget.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{budget.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span className="capitalize">{budget.period}</span>
                        <Badge variant={status.status === 'good' ? 'default' : status.status === 'warning' ? 'secondary' : 'destructive'}>
                          {status.text}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(budget)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(budget)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(progress.spent)} / {formatCurrency(budget.amount)}
                        </span>
                      </div>
                      <Progress value={progress.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{progress.percentage.toFixed(1)}% used</span>
                        <span>{formatCurrency(parseFloat(budget.amount) - progress.spent)} remaining</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Account</span>
                        <p className="font-medium truncate">{getAccountName(budget.accountId)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category</span>
                        <p className="font-medium truncate">{getCategoryName(budget.categoryId)}</p>
                      </div>
                    </div>

                    {budget.description && (
                      <p className="text-sm text-muted-foreground">{budget.description}</p>
                    )}

                    {progress.percentage >= parseFloat(budget.alertThreshold || "0.80") * 100 && (
                      <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Alert threshold reached</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? "Edit Budget" : "Create New Budget"}
            </DialogTitle>
          </DialogHeader>
          <BudgetForm
            budget={editingBudget}
            accounts={accounts}
            categories={categories}
            onSubmit={(data: any) => {
              if (editingBudget) {
                updateMutation.mutate({ id: editingBudget.id, data });
              } else {
                createMutation.mutate(data);
              }
            }}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingBudget(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingBudget} onOpenChange={() => setDeletingBudget(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingBudget?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingBudget && deleteMutation.mutate(deletingBudget.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}