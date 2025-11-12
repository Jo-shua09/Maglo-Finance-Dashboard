import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Filter, Plus, Search, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CreateInvoiceDialog } from "@/components/CreateInvoiceDialog";
import { formatDistanceToNow } from "date-fns";
import { databases, databaseId, collectionId, ID } from "@/integrations/appwrite/client";
import { Query, Models } from "appwrite";
import { Input } from "@/components/ui/input";
import { FaFileInvoice, FaFilter } from "react-icons/fa6";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IoFilterSharp } from "react-icons/io5";

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
        {
          id: "1",
          client_name: "John Doe",
          client_email: "john@example.com",
          amount: 1000,
          vat_percentage: 7.5,
          vat_amount: 75,
          total_amount: 1075,
          due_date: "2024-12-31",
          status: "paid",
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
            <div className="w-full relative">
              <Input type="search" placeholder="Search invoices" className="pl-10 rounded-xl border-0" />
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
          <div className="flex space-x-4 items-center">
            <Button onClick={() => setDialogOpen(true)} className="bg-primary font-semibold text-primary-foreground hover:bg-primary/90">
              <FaFileInvoice className="h-4 w-4" />
              Create Invoice
            </Button>

            <Button variant="outline" className="font-semibold text-primary-foreground">
              <IoFilterSharp className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader className="p-0">
            <TableRow className="!border-b-0 text-xs font-semibold">
              <TableHead>Name/Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>VAT</TableHead>
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
                    <div className="flex space-x-3 items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gray-300 text-primary-foreground">{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="">
                        <p className="font-medium">{invoice.client_name}</p>
                        <p className="text-sm text-muted-foreground">{invoice.client_email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="">
                    <p>{new Date(invoice.created_at).toLocaleDateString()}</p>
                  </TableCell>
                  <TableCell className="font-bold">${Number(invoice.amount).toLocaleString()}</TableCell>
                  <TableCell>
                    ${Number(invoice.vat_amount).toLocaleString()} ({invoice.vat_percentage}%)
                  </TableCell>
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
                    <Badge
                      variant={
                        invoice.status === "paid"
                          ? "default"
                          : invoice.status === "unpaid"
                          ? "secondary"
                          : invoice.status === "pending"
                          ? "pending"
                          : "pending"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {invoice.status === "unpaid" && <DropdownMenuItem onClick={() => markAsPaid(invoice.id)}>Mark as Paid</DropdownMenuItem>}
                        <DropdownMenuItem onClick={() => deleteInvoice(invoice.id)} className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <CreateInvoiceDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchInvoices} />
      </div>
    </DashboardLayout>
  );
}
