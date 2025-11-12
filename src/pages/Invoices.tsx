import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CreateInvoiceDialog } from "@/components/CreateInvoiceDialog";
import { formatDistanceToNow } from "date-fns";
import { databases, databaseId, collectionId, ID } from "@/integrations/appwrite/client";
import { Query } from "appwrite";

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
}

export default function Invoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const fetchInvoices = async () => {
    if (!user) return;

    try {
      const response = await databases.listDocuments(databaseId, collectionId, [Query.equal("user_id", user.$id)]);

      const fetchedInvoices: Invoice[] = response.documents.map((doc) => ({
        id: doc.$id,
        client_name: doc.client_name,
        client_email: doc.client_email,
        amount: doc.amount,
        vat_percentage: doc.vat_percentage,
        vat_amount: doc.vat_amount,
        total_amount: doc.total_amount,
        due_date: doc.due_date,
        status: doc.status,
        created_at: doc.created_at,
      }));

      setInvoices(fetchedInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
      // Fallback to mock data if database fails
      const mockInvoices: Invoice[] = [
        {
          id: "1",
          client_name: "John Doe",
          client_email: "john@example.com",
          amount: 1000,
          vat_percentage: 7.5,
          vat_amount: 75,
          total_amount: 1075,
          due_date: "2024-12-31",
          status: "unpaid",
          created_at: new Date().toISOString(),
        },
      ];
      setInvoices(mockInvoices);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id: string) => {
    try {
      await databases.updateDocument(databaseId, collectionId, id, {
        status: "paid",
      });
      toast.success("Invoice marked as paid");
      fetchInvoices();
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      toast.error("Failed to mark invoice as paid");
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await databases.deleteDocument(databaseId, collectionId, id);
      toast.success("Invoice deleted");
      fetchInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === "all") return true;
    return inv.status === filter;
  });

  const getDaysUntilDue = (dueDate: string) => {
    return formatDistanceToNow(new Date(dueDate), { addSuffix: true });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">Manage your invoices and track payments</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All
          </Button>
          <Button variant={filter === "paid" ? "default" : "outline"} size="sm" onClick={() => setFilter("paid")}>
            Paid
          </Button>
          <Button variant={filter === "unpaid" ? "default" : "outline"} size="sm" onClick={() => setFilter("unpaid")}>
            Unpaid
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>VAT</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.client_name}</p>
                          <p className="text-sm text-muted-foreground">{invoice.client_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>₦{Number(invoice.amount).toLocaleString()}</TableCell>
                      <TableCell>
                        ₦{Number(invoice.vat_amount).toLocaleString()} ({invoice.vat_percentage}%)
                      </TableCell>
                      <TableCell className="font-medium">₦{Number(invoice.total_amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <div>
                          <p>{new Date(invoice.due_date).toLocaleDateString()}</p>
                          <p
                            className={`text-xs ${
                              new Date(invoice.due_date) < new Date() && invoice.status === "unpaid"
                                ? "text-destructive font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            {getDaysUntilDue(invoice.due_date)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>{invoice.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {invoice.status === "unpaid" && (
                            <Button size="sm" variant="outline" onClick={() => markAsPaid(invoice.id)}>
                              Mark Paid
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => deleteInvoice(invoice.id)}>
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <CreateInvoiceDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchInvoices} />
      </div>
    </DashboardLayout>
  );
}
