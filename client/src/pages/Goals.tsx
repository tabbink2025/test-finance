import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Edit, Trash2, Target, Trophy, Clock } from "lucide-react";
import type { Goal, Account } from "@shared/schema";
import GoalForm from "@/components/forms/GoalForm";
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

export default function Goals() {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [deletingGoal, setDeletingGoal] = useState<Goal | undefined>(undefined);
  const { toast } = useToast();

  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/goals", {
        ...data,
        targetAmount: data.targetAmount.toString(),
        currentAmount: data.currentAmount.toString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setShowForm(false);
      setEditingGoal(undefined);
      toast({
        title: "Success",
        description: "Goal created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/goals/${id}`, {
        ...data,
        targetAmount: data.targetAmount.toString(),
        currentAmount: data.currentAmount.toString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setShowForm(false);
      setEditingGoal(undefined);
      toast({
        title: "Success",
        description: "Goal updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setDeletingGoal(undefined);
      toast({
        title: "Success",
        description: "Goal deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: any) => {
    if (editingGoal) {
      updateGoalMutation.mutate({ id: editingGoal.id, data });
    } else {
      createGoalMutation.mutate(data);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleDelete = (goal: Goal) => {
    setDeletingGoal(goal);
  };

  const confirmDelete = () => {
    if (deletingGoal) {
      deleteGoalMutation.mutate(deletingGoal.id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const getAccountName = (accountId: number) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.name || "Unknown";
  };

  // Separate active and completed goals
  const activeGoals = goals.filter(goal => !goal.isCompleted);
  const completedGoals = goals.filter(goal => goal.isCompleted);

  // Calculate statistics
  const totalTargetAmount = goals.reduce((sum, goal) => sum + parseFloat(goal.targetAmount), 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + parseFloat(goal.currentAmount), 0);
  const averageProgress = goals.length > 0 
    ? goals.reduce((sum, goal) => {
        const progress = (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;
        return sum + Math.min(progress, 100);
      }, 0) / goals.length
    : 0;

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Savings Goals</h1>
          <p className="text-gray-600">Track and achieve your financial goals</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Goals</p>
              <p className="text-3xl font-bold text-gray-900">{goals.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Target Amount</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(totalTargetAmount)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Saved Amount</p>
              <p className="text-3xl font-bold text-secondary">{formatCurrency(totalCurrentAmount)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Average Progress</p>
              <p className="text-3xl font-bold text-warning">{Math.round(averageProgress)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-primary" />
              <span>Active Goals ({activeGoals.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeGoals.map((goal) => {
                const progress = (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;
                const isOverdue = goal.deadline && new Date(goal.deadline) < new Date();
                
                return (
                  <Card key={goal.id} className="relative">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{goal.name}</h3>
                          <p className="text-sm text-gray-500">{getAccountName(goal.accountId)}</p>
                          {goal.description && (
                            <p className="text-sm text-gray-600 mt-2">{goal.description}</p>
                          )}
                        </div>
                        
                        <div className="flex space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(goal)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(goal)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        
                        <Progress value={Math.min(progress, 100)} className="h-2" />
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                          </span>
                          <span className="text-gray-600">
                            {formatCurrency(parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount))} left
                          </span>
                        </div>

                        {goal.deadline && (
                          <div className="flex items-center space-x-2 mt-3">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className={`text-sm ${isOverdue ? 'text-danger' : 'text-gray-600'}`}>
                              Target: {formatDate(goal.deadline)}
                              {isOverdue && " (Overdue)"}
                            </span>
                          </div>
                        )}

                        {progress >= 100 && (
                          <Badge variant="default" className="bg-secondary">
                            Goal Achieved!
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-warning" />
              <span>Completed Goals ({completedGoals.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedGoals.map((goal) => (
                <Card key={goal.id} className="relative border-secondary/20 bg-secondary/5">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{goal.name}</h3>
                        <p className="text-sm text-gray-500">{getAccountName(goal.accountId)}</p>
                        {goal.description && (
                          <p className="text-sm text-gray-600 mt-2">{goal.description}</p>
                        )}
                      </div>
                      
                      <Badge variant="default" className="bg-secondary">
                        <Trophy className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <Progress value={100} className="h-2" />
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Final Amount</span>
                        <span className="font-medium text-secondary">
                          {formatCurrency(goal.currentAmount)}
                        </span>
                      </div>

                      {goal.deadline && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Completed by {formatDate(goal.deadline)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-4">Start setting financial goals to track your progress</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Goal Dialog */}
      <Dialog open={showForm} onOpenChange={() => {
        setShowForm(false);
        setEditingGoal(undefined);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingGoal ? "Edit Goal" : "Add Goal"}
            </DialogTitle>
          </DialogHeader>
          <GoalForm
            goal={editingGoal}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingGoal(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingGoal} onOpenChange={() => setDeletingGoal(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the goal "{deletingGoal?.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
