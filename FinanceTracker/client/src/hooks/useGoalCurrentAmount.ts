import { useQuery } from "@tanstack/react-query";
import type { GoalAllocation } from "@shared/schema";

interface GoalCurrentAmountResponse {
  goalId: number;
  currentAmount: number;
}

export function useGoalCurrentAmount(goalId: number) {
  return useQuery<GoalCurrentAmountResponse>({
    queryKey: ["goals", goalId, "current-amount"],
    queryFn: async () => {
      const response = await fetch(`/api/goals/${goalId}/current-amount`);
      if (!response.ok) {
        throw new Error('Failed to fetch goal current amount');
      }
      return response.json();
    },
    enabled: !!goalId,
  });
}

export function useGoalAllocations(goalId: number) {
  return useQuery<GoalAllocation[]>({
    queryKey: ["goals", goalId, "allocations"],
    queryFn: async () => {
      const response = await fetch(`/api/goals/${goalId}/allocations`);
      if (!response.ok) {
        throw new Error('Failed to fetch goal allocations');
      }
      return response.json();
    },
    enabled: !!goalId,
  });
} 