import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { databases, databaseId, collectionId, ID } from "@/integrations/appwrite/client";

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateInvoiceDialog({ open, onOpenChange, onSuccess }: CreateInvoiceDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    amount: "",
    vatPercentage: "7.5",
    dueDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const amount = parseFloat(formData.amount);
    const vatPercentage = parseFloat(formData.vatPercentage);
    const vatAmount = (amount * vatPercentage) / 100;
    const totalAmount = amount + vatAmount;

    try {
      await databases.createDocument(databaseId, collectionId, ID.unique(), {
        client_name: formData.clientName,
        client_email: formData.clientEmail,
        amount: amount,
        vat_percentage: vatPercentage,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        due_date: formData.dueDate,
        status: "unpaid",
        user_id: user.$id,
        created_at: new Date().toISOString(),
      });

      toast.success("Invoice created successfully");
      setFormData({
        clientName: "",
        clientEmail: "",
        amount: "",
        vatPercentage: "7.5",
        dueDate: "",
      });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const vatAmount = formData.amount && formData.vatPercentage ? (parseFloat(formData.amount) * parseFloat(formData.vatPercentage)) / 100 : 0;

  const totalAmount = formData.amount ? parseFloat(formData.amount) + vatAmount : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
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
            <Label htmlFor="amount">Amount (₦)</Label>
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
                <span>₦{parseFloat(formData.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>VAT ({formData.vatPercentage}%):</span>
                <span>₦{vatAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total:</span>
                <span>₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Invoice"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
