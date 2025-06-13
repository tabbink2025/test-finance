import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, DollarSign, List } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useGoalCurrentAmount } from "@/hooks/useGoalCurrentAmount";
import type { Goal } from "@shared/schema";

interface GoalCardProps {
  goal: Goal;
  accountName: string;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onAllocate: (goalId: number) => void;
  onManageAllocations: (goalId: number) => void;
}

export function GoalCard({ goal, accountName, onEdit, onDelete, onAllocate, onManageAllocations }: GoalCardProps) {
  const { data: currentAmountData } = useGoalCurrentAmount(goal.id);
  const currentAmount = currentAmountData?.currentAmount || 0;
  
  const targetAmount = parseFloat(goal.targetAmount);
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const isCompleted = progress >= 100;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className={`transition-all hover:shadow-md ${isCompleted ? 'border-green-200 bg-green-50' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{goal.name}</h3>
              {isCompleted && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Completed
                </Badge>
              )}
            </div>
            {goal.description && (
              <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
            )}
            <div className="text-sm text-gray-500">
              <p>Account: {accountName}</p>
              {goal.deadline && (
                <p>Deadline: {formatDate(goal.deadline)}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAllocate(goal.id)}
              className="text-green-600 hover:text-green-700"
              title="Allocate Money"
            >
              <DollarSign className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageAllocations(goal.id)}
              className="text-blue-600 hover:text-blue-700"
              title="Manage Allocations"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(goal)}
              title="Edit Goal"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(goal)}
              className="text-red-600 hover:text-red-700"
              title="Delete Goal"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Allocated Amount</span>
            <span className="font-medium">{formatCurrency(currentAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Target Amount</span>
            <span className="font-medium">{formatCurrency(targetAmount)}</span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{Math.round(progress)}% complete</span>
            <span>{formatCurrency(Math.max(0, targetAmount - currentAmount))} remaining</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 