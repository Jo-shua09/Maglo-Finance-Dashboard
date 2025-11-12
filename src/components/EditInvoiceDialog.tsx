import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { databases, databaseId, collectionId } from "@/integrations/appwrite/client";

interface Invoice {
  id: string;
  client_name: string;
  client_email: string;
  amount: number;
  vat_percentage: number;
  vat_amount: number;
  total_amount: number;
  due_date: string;
  status: string;
  created_at: string;
  items?: { name: string; quantity: number; rate: number; amount: number }[];
}

interface EditInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onSuccess: () => void;
}

export function EditInvoiceDialog({ open, onOpenChange, invoice, onSuccess }: EditInvoiceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    amount: "",
    vatPercentage: "",
    dueDate: "",
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        clientName: invoice.client_name,
        clientEmail: invoice.client_email,
        amount: invoice.amount.toString(),
        vatPercentage: invoice.vat_percentage.toString(),
        dueDate: invoice.due_date.split("T")[0], // Format for date input
      });
    }
  }, [invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    setLoading(true);

    const amount = parseFloat(formData.amount);
    const vatPercentage = parseFloat(formData.vatPercentage);
    const vatAmount = (amount * vatPercentage) / 100;
    const totalAmount = amount + vatAmount;

    try {
      await databases.updateDocument(databaseId, collectionId, invoice.id, {
        client_name: formData.clientName,
        client_email: formData.clientEmail,
        amount: amount,
        vat_percentage: vatPercentage,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        due_date: formData.dueDate,
      });

      toast.success("Invoice updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
    } finally {
      setLoading(false);
    }
  };

  const vatAmount = formData.amount && formData.vatPercentage ? (parseFloat(formData.amount) * parseFloat(formData.vatPercentage)) / 100 : 0;
  const totalAmount = formData.amount ? parseFloat(formData.amount) + vatAmount : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" aria-describedby="edit-invoice-description">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
          <p id="edit-invoice-description" className="text-sm text-muted-foreground">
            Update the details below to modify the invoice.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input id="clientName" value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientEmail">Client Email</Label>
            <Input
              id="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vatPercentage">VAT (%)</Label>
            <Input
              id="vatPercentage"
              type="number"
              step="0.01"
              value={formData.vatPercentage}
              onChange={(e) => setFormData({ ...formData, vatPercentage: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>

          {formData.amount && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Amount:</span>
                <span>${parseFloat(formData.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>VAT ({formData.vatPercentage}%):</span>
                <span>${vatAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total:</span>
                <span>${totalAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Invoice"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
