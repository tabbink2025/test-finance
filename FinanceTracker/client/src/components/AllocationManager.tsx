import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import GoalAllocationForm from "@/components/forms/GoalAllocationForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { GoalAllocation, Goal } from "@shared/schema";

interface AllocationManagerProps {
  goalId: number;
  onClose: () => void;
}

export function AllocationManager({ goalId, onClose }: AllocationManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<GoalAllocation | undefined>();
  const [deletingAllocation, setDeletingAllocation] = useState<GoalAllocation | undefined>();
  const { toast } = useToast();

  // Fetch goal details
  const { data: goal } = useQuery<Goal>({
    queryKey: [`/api/goals/${goalId}`],
  });

  // Fetch allocations for this goal
  const { data: allocations = [], isLoading } = useQuery<GoalAllocation[]>({
    queryKey: [`/api/goals/${goalId}/allocations`],
  });

  const createAllocationMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/goal-allocations", {
        ...data,
        amount: data.amount.toString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/goals/${goalId}/allocations`] });
      queryClient.invalidateQueries({ queryKey: ["goals", goalId, "current-amount"] });
      setShowForm(false);
      setEditingAllocation(undefined);
      toast({
        title: "Success",
        description: "Allocation created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create allocation",
        variant: "destructive",
      });
    },
  });

  const updateAllocationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/goal-allocations/${id}`, {
        ...data,
        amount: data.amount.toString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/goals/${goalId}/allocations`] });
      queryClient.invalidateQueries({ queryKey: ["goals", goalId, "current-amount"] });
      setShowForm(false);
      setEditingAllocation(undefined);
      toast({
        title: "Success",
        description: "Allocation updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update allocation",
        variant: "destructive",
      });
    },
  });

  const deleteAllocationMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/goal-allocations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/goals/${goalId}/allocations`] });
      queryClient.invalidateQueries({ queryKey: ["goals", goalId, "current-amount"] });
      setDeletingAllocation(undefined);
      toast({
        title: "Success",
        description: "Allocation deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete allocation",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: any) => {
    if (editingAllocation) {
      updateAllocationMutation.mutate({ id: editingAllocation.id, data });
    } else {
      createAllocationMutation.mutate(data);
    }
  };

  const handleEdit = (allocation: GoalAllocation) => {
    setEditingAllocation(allocation);
    setShowForm(true);
  };

  const handleDelete = (allocation: GoalAllocation) => {
    setDeletingAllocation(allocation);
  };

  const confirmDelete = () => {
    if (deletingAllocation) {
      deleteAllocationMutation.mutate(deletingAllocation.id);
    }
  };

  const totalAllocated = allocations.reduce((sum, allocation) => 
    sum + parseFloat(allocation.amount), 0
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Manage Allocations</h2>
          <p className="text-gray-600">Goal: {goal?.name}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Allocation
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Allocated</span>
            <span className="font-semibold text-lg">{formatCurrency(totalAllocated)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Allocations List */}
      <div className="space-y-4">
        {allocations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 mb-4">No allocations yet</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Allocation
              </Button>
            </CardContent>
          </Card>
        ) : (
          allocations.map((allocation) => (
            <Card key={allocation.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-lg">
                        {formatCurrency(parseFloat(allocation.amount))}
                      </span>
                      <Badge variant="outline">
                        {formatDate(allocation.date)}
                      </Badge>
                    </div>
                    {allocation.description && (
                      <p className="text-sm text-gray-600">{allocation.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(allocation)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(allocation)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Allocation Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAllocation ? "Edit Allocation" : "Add New Allocation"}
            </DialogTitle>
          </DialogHeader>
          <GoalAllocationForm
            allocation={editingAllocation}
            goalId={goalId}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingAllocation(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAllocation} onOpenChange={() => setDeletingAllocation(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Allocation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this allocation of{" "}
              {deletingAllocation && formatCurrency(parseFloat(deletingAllocation.amount))}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 