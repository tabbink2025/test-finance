import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Edit, Trash2, Target, Trophy, Clock, DollarSign } from "lucide-react";
import type { Goal, Account, GoalAllocation } from "@shared/schema";
import GoalForm from "@/components/forms/GoalForm";
import GoalAllocationForm from "@/components/forms/GoalAllocationForm";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GoalCard } from "@/components/GoalCard";
import { AllocationManager } from "@/components/AllocationManager";
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
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [showAllocationManager, setShowAllocationManager] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [deletingGoal, setDeletingGoal] = useState<Goal | undefined>(undefined);
  const { toast } = useToast();

  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  // Fetch all goal allocations to calculate totals
  const { data: allAllocations = [] } = useQuery<GoalAllocation[]>({
    queryKey: ["/api/goal-allocations"],
  });

  // Goals will be handled by individual GoalCard components

  const createGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/goals", {
        ...data,
        targetAmount: data.targetAmount.toString(),
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

  const createAllocationMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/goal-allocations", {
        ...data,
        amount: data.amount.toString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["goals", selectedGoalId, "current-amount"] });
      setShowAllocationForm(false);
      setSelectedGoalId(null);
      toast({
        title: "Success",
        description: "Money allocated to goal successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to allocate money to goal",
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

  const handleAllocationSubmit = (data: any) => {
    createAllocationMutation.mutate(data);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleAllocate = (goalId: number) => {
    setSelectedGoalId(goalId);
    setShowAllocationForm(true);
  };

  const handleManageAllocations = (goalId: number) => {
    setSelectedGoalId(goalId);
    setShowAllocationManager(true);
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

  // Calculate statistics with actual data
  const statistics = useMemo(() => {
    const totalTargetAmount = goals.reduce((sum, goal) => sum + parseFloat(goal.targetAmount), 0);
    
    // Calculate total current amount from allocations
    const goalIds = goals.map(g => g.id);
    const totalCurrentAmount = allAllocations
      .filter(allocation => goalIds.includes(allocation.goalId))
      .reduce((sum, allocation) => sum + parseFloat(allocation.amount), 0);
    
    // Calculate average progress
    let totalProgress = 0;
    let validGoalsCount = 0;
    
    goals.forEach(goal => {
      const goalTargetAmount = parseFloat(goal.targetAmount);
      if (goalTargetAmount > 0) {
        const goalCurrentAmount = allAllocations
          .filter(allocation => allocation.goalId === goal.id)
          .reduce((sum, allocation) => sum + parseFloat(allocation.amount), 0);
        
        const progress = (goalCurrentAmount / goalTargetAmount) * 100;
        totalProgress += Math.min(progress, 100); // Cap at 100%
        validGoalsCount++;
      }
    });
    
    const averageProgress = validGoalsCount > 0 ? totalProgress / validGoalsCount : 0;
    
    return {
      totalTargetAmount,
      totalCurrentAmount,
      averageProgress
    };
  }, [goals, allAllocations]);

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
              <p className="text-3xl font-bold text-primary">{formatCurrency(statistics.totalTargetAmount)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Allocated Amount</p>
              <p className="text-3xl font-bold text-secondary">{formatCurrency(statistics.totalCurrentAmount)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Average Progress</p>
              <p className="text-3xl font-bold text-warning">{Math.round(statistics.averageProgress)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Active Goals ({activeGoals.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                accountName={getAccountName(goal.accountId)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAllocate={handleAllocate}
                onManageAllocations={handleManageAllocations}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-600" />
            Completed Goals ({completedGoals.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                accountName={getAccountName(goal.accountId)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAllocate={handleAllocate}
                onManageAllocations={handleManageAllocations}
              />
            ))}
          </div>
        </div>
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
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGoal ? "Edit Goal" : "Add New Goal"}
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

      {/* Allocate Money Dialog */}
      <Dialog open={showAllocationForm} onOpenChange={setShowAllocationForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Money to Goal</DialogTitle>
          </DialogHeader>
          {selectedGoalId && (
            <GoalAllocationForm
              goalId={selectedGoalId}
              onSubmit={handleAllocationSubmit}
              onCancel={() => {
                setShowAllocationForm(false);
                setSelectedGoalId(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Allocation Manager Dialog */}
      <Dialog open={showAllocationManager} onOpenChange={setShowAllocationManager}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage Allocations</DialogTitle>
          </DialogHeader>
          {selectedGoalId && (
            <AllocationManager
              goalId={selectedGoalId}
              onClose={() => {
                setShowAllocationManager(false);
                setSelectedGoalId(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingGoal} onOpenChange={() => setDeletingGoal(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingGoal?.name}"? This action cannot be undone
              and will also delete all allocations for this goal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-danger">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
