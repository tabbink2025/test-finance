import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { 
  Plus, 
  Lightbulb, 
  Search, 
  Edit, 
  Trash2,
  DollarSign,
  Clock,
  Star,
  User
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SavingTacticForm from "@/components/forms/SavingTacticForm";
import type { SavingTactic } from "@shared/schema";

const DIFFICULTY_COLORS = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800", 
  hard: "bg-red-100 text-red-800"
};

const CATEGORY_COLORS = {
  budgeting: "bg-blue-100 text-blue-800",
  automation: "bg-purple-100 text-purple-800",
  mindset: "bg-pink-100 text-pink-800",
  lifestyle: "bg-green-100 text-green-800",
  investment: "bg-indigo-100 text-indigo-800",
  emergency: "bg-orange-100 text-orange-800",
  custom: "bg-gray-100 text-gray-800"
};

export default function SavingTactics() {
  const [showForm, setShowForm] = useState(false);
  const [editingTactic, setEditingTactic] = useState<SavingTactic | undefined>();
  const [deletingTactic, setDeletingTactic] = useState<SavingTactic | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const { toast } = useToast();

  // Fetch all saving tactics
  const { data: allTactics = [], isLoading } = useQuery<SavingTactic[]>({
    queryKey: ["/api/saving-tactics"],
  });

  const createTacticMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/saving-tactics", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saving-tactics"] });
      setShowForm(false);
      setEditingTactic(undefined);
      toast({
        title: "Success",
        description: "Saving tactic created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create saving tactic",
        variant: "destructive",
      });
    },
  });

  const updateTacticMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/saving-tactics/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saving-tactics"] });
      setShowForm(false);
      setEditingTactic(undefined);
      toast({
        title: "Success", 
        description: "Saving tactic updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update saving tactic",
        variant: "destructive",
      });
    },
  });

  const deleteTacticMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/saving-tactics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saving-tactics"] });
      setDeletingTactic(undefined);
      toast({
        title: "Success",
        description: "Saving tactic deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete saving tactic",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: any) => {
    if (editingTactic) {
      updateTacticMutation.mutate({ id: editingTactic.id, data });
    } else {
      createTacticMutation.mutate(data);
    }
  };

  const handleEdit = (tactic: SavingTactic) => {
    setEditingTactic(tactic);
    setShowForm(true);
  };

  const handleDelete = (tactic: SavingTactic) => {
    setDeletingTactic(tactic);
  };

  const confirmDelete = () => {
    if (deletingTactic) {
      deleteTacticMutation.mutate(deletingTactic.id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Saving Tactics</h1>
          <p className="text-gray-600">Discover and create strategies to save money</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Your Tactic
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allTactics.map((tactic) => (
          <Card key={tactic.id} className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{tactic.title}</CardTitle>
                    {tactic.isPersonal ? (
                      <User className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Star className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex gap-2 mb-3">
                    <Badge variant="outline">{tactic.difficulty}</Badge>
                    <Badge variant="outline">{tactic.category}</Badge>
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(tactic)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(tactic)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{tactic.description}</p>
              
              <div className="space-y-2 mb-4">
                {tactic.estimatedSavings && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-medium">{tactic.estimatedSavings}</span>
                  </div>
                )}
                {tactic.timeToImplement && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-600">{tactic.timeToImplement}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {allTactics.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tactics yet</h3>
            <p className="text-gray-600 mb-4">Create your first saving strategy</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Tactic
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTactic ? "Edit Your Tactic" : "Add New Saving Tactic"}
            </DialogTitle>
          </DialogHeader>
          <SavingTacticForm
            tactic={editingTactic}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingTactic(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingTactic} onOpenChange={() => setDeletingTactic(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Saving Tactic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTactic?.title}"? This action cannot be undone.
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