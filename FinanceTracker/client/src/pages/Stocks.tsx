import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Stock, Account } from "@shared/schema";
import StockForm from "@/components/forms/StockForm";
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

export default function Stocks() {
  const [showForm, setShowForm] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | undefined>(undefined);
  const [deletingStock, setDeletingStock] = useState<Stock | undefined>(undefined);
  const { toast } = useToast();

  const { data: stocks = [], isLoading } = useQuery<Stock[]>({
    queryKey: ["/api/stocks"],
  });

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const createStockMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/stocks", {
        ...data,
        shares: data.shares.toString(),
        purchasePrice: data.purchasePrice.toString(),
        currentPrice: data.currentPrice.toString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stocks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setShowForm(false);
      setEditingStock(undefined);
      toast({ title: "Success", description: "Stock added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add stock", variant: "destructive" });
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/stocks/${id}`, {
        ...data,
        shares: data.shares.toString(),
        purchasePrice: data.purchasePrice.toString(),
        currentPrice: data.currentPrice.toString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stocks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setShowForm(false);
      setEditingStock(undefined);
      toast({ title: "Success", description: "Stock updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update stock", variant: "destructive" });
    },
  });

  const deleteStockMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/stocks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stocks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setDeletingStock(undefined);
      toast({ title: "Success", description: "Stock deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete stock", variant: "destructive" });
    },
  });

  const handleSubmit = (data: any) => {
    if (editingStock) {
      updateStockMutation.mutate({ id: editingStock.id, data });
    } else {
      createStockMutation.mutate(data);
    }
  };

  const handleEdit = (stock: Stock) => {
    setEditingStock(stock);
    setShowForm(true);
  };

  const handleDelete = (stock: Stock) => {
    setDeletingStock(stock);
  };

  const confirmDelete = () => {
    if (deletingStock) {
      deleteStockMutation.mutate(deletingStock.id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const getAccountName = (accountId: number) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.name || "Unknown";
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Stocks</h1>
          <p className="text-gray-600">Track your investment portfolio</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Stock
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stocks ({stocks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {stocks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stocks yet</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first stock</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Stock
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {stocks.map(stock => (
                <div key={stock.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">
                        {stock.symbol} - {stock.name}
                      </h3>
                      <Badge variant="secondary">{getAccountName(stock.accountId)}</Badge>
                    </div>
                    {stock.notes && <p className="text-sm text-gray-400">{stock.notes}</p>}
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-lg font-semibold text-gray-900">{stock.shares} @ {formatCurrency(stock.currentPrice)}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(stock)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(stock)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Stock Dialog */}
      <Dialog open={showForm} onOpenChange={() => { setShowForm(false); setEditingStock(undefined); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingStock ? "Edit Stock" : "Add Stock"}</DialogTitle>
          </DialogHeader>
          <StockForm
            stock={editingStock}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingStock(undefined); }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingStock} onOpenChange={() => setDeletingStock(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deletingStock?.symbol} from your portfolio. This action cannot be undone.
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
