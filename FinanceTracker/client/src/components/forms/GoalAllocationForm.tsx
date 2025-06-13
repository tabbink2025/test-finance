import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGoalAllocationSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import type { GoalAllocation, Account, Goal } from "@shared/schema";

interface GoalAllocationFormProps {
  allocation?: GoalAllocation;
  goalId: number;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function GoalAllocationForm({ 
  allocation, 
  goalId, 
  onSubmit, 
  onCancel 
}: GoalAllocationFormProps) {
  // Fetch goal details to get the account
  const { data: goal } = useQuery<Goal>({
    queryKey: [`/api/goals/${goalId}`],
    queryFn: async () => {
      const response = await fetch(`/api/goals/${goalId}`);
      if (!response.ok) throw new Error('Failed to fetch goal');
      return response.json();
    },
  });

  // Fetch account details to get available balance
  const { data: account } = useQuery<Account>({
    queryKey: [`/api/accounts/${goal?.accountId}`],
    queryFn: async () => {
      if (!goal?.accountId) return null;
      const response = await fetch(`/api/accounts/${goal.accountId}`);
      if (!response.ok) throw new Error('Failed to fetch account');
      return response.json();
    },
    enabled: !!goal?.accountId,
  });

  // Fetch all goals for this account to calculate total allocated amounts
  const { data: accountGoals = [] } = useQuery<Goal[]>({
    queryKey: [`/api/goals/account/${goal?.accountId}`],
    queryFn: async () => {
      if (!goal?.accountId) return [];
      const response = await fetch(`/api/goals`);
      if (!response.ok) throw new Error('Failed to fetch goals');
      const allGoals = await response.json();
      return allGoals.filter((g: Goal) => g.accountId === goal.accountId);
    },
    enabled: !!goal?.accountId,
  });

  // Fetch all goal allocations to calculate total allocated amount
  const { data: allAllocations = [] } = useQuery<GoalAllocation[]>({
    queryKey: ["/api/goal-allocations"],
    queryFn: async () => {
      const response = await fetch("/api/goal-allocations");
      if (!response.ok) throw new Error('Failed to fetch allocations');
      return response.json();
    },
    enabled: !!goal?.accountId,
  });

  // Create dynamic schema with balance validation
  const createAllocationFormSchema = (maxAmount: number) => {
    return insertGoalAllocationSchema.extend({
      amount: z.string()
        .min(1, "Amount is required")
        .refine((val) => {
          const amount = parseFloat(val);
          return !isNaN(amount) && amount > 0;
        }, "Amount must be a positive number")
        .refine((val) => {
          const amount = parseFloat(val);
          return amount <= maxAmount;
        }, `Amount cannot exceed available balance of ${formatCurrency(maxAmount)}`),
    });
  };

  // Calculate total allocated amount for all goals in this account
  const accountGoalIds = accountGoals.map(g => g.id);
  const totalAllocatedForAccount = allAllocations
    .filter(allocation => accountGoalIds.includes(allocation.goalId))
    .reduce((sum, allocation) => sum + parseFloat(allocation.amount), 0);

  // Calculate current goal's allocated amount (for editing existing allocations)
  const currentGoalAllocated = allAllocations
    .filter(alloc => alloc.goalId === goalId && (!allocation || alloc.id !== allocation.id))
    .reduce((sum, alloc) => sum + parseFloat(alloc.amount), 0);

  const accountBalance = account ? parseFloat(account.balance) : 0;
  const unallocatedBalance = accountBalance - totalAllocatedForAccount;
  const availableForThisAllocation = unallocatedBalance + (allocation ? parseFloat(allocation.amount) : 0);

  const allocationFormSchema = createAllocationFormSchema(availableForThisAllocation);
  type AllocationFormData = z.infer<typeof allocationFormSchema>;

  const form = useForm<AllocationFormData>({
    resolver: zodResolver(allocationFormSchema),
    defaultValues: {
      goalId: allocation?.goalId || goalId,
      amount: allocation?.amount || "",
      description: allocation?.description || "",
      date: allocation?.date || new Date().toISOString().split('T')[0],
    },
  });

  const handleSubmit = (data: AllocationFormData) => {
    onSubmit({
      ...data,
      goalId: Number(data.goalId),
      amount: data.amount,
    });
  };

  if (!goal || !account) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Account Balance Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Account Information</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Account:</strong> {account.name}</p>
          <p><strong>Goal:</strong> {goal.name}</p>
          <div className="border-t border-blue-200 pt-2 mt-2">
            <p><strong>Account Balance:</strong> {formatCurrency(accountBalance)}</p>
            <p><strong>Total Allocated:</strong> {formatCurrency(totalAllocatedForAccount)}</p>
            <p className="text-blue-900 font-semibold"><strong>Available to Allocate:</strong> {formatCurrency(availableForThisAllocation)}</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount to Allocate</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    max={availableForThisAllocation}
                    {...field} 
                  />
                </FormControl>
                <div className="text-xs text-gray-500 mt-1">
                  Maximum: {formatCurrency(availableForThisAllocation)}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="e.g. Monthly savings allocation..." 
                    {...field} 
                    value={field.value || ""} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex space-x-3 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {allocation ? "Update" : "Add"} Allocation
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 