import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { databases, databaseId, collectionId } from "@/integrations/appwrite/client";
import { Query } from "appwrite";
import { FaWallet } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Invoice {
  id: string;
  client_name: string;
  client_email: string;
  amount: number;
  vat_percentage: number;
  vat_amount: number;
  total_amount: number;
  status: string;
  due_date: string;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

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
        status: doc.status,
        due_date: doc.due_date,
        created_at: doc.created_at,
      }));

      setInvoices(fetchedInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
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
          status: "unpaid",
          due_date: "2024-12-31",
          created_at: new Date().toISOString(),
        },
      ];
      setInvoices(mockInvoices);
    } finally {
      setLoading(false);
    }
  };

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((inv) => inv.status === "paid");
  const unpaidInvoices = invoices.filter((inv) => inv.status === "unpaid");

  const totalPaid = paidInvoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const totalPending = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const totalVAT = paidInvoices.reduce((sum, inv) => sum + Number(inv.vat_amount), 0);

  const chartData = [
    { name: "Paid", value: paidInvoices.length },
    { name: "Unpaid", value: unpaidInvoices.length },
  ];

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-foreground rounded-xl border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/20 p-2">
                  <FaWallet className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Total Invoices</div>
                  <div className="text-2xl font-bold text-white">{totalInvoices}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl bg-background border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-gray-200 p-2">
                  <FaWallet className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Amount Paid</div>
                  <div className="text-2xl font-bold">
                    ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl bg-background border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-gray-200 p-2">
                  <FaWallet className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Pending Payments</div>
                  <div className="text-2xl font-bold">
                    ${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl bg-background border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-gray-200 p-2">
                  <FaWallet className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">VAT collected</p>
                  <div className="text-2xl font-bold">${totalVAT.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Invoices</CardTitle>
              <Button variant="outline" onClick={() => (window.location.href = "/invoices")}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="!border-b-0 text-xs font-semibold">
                  <TableHead>Name/Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>VAT</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 5)
                  .map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => (window.location.href = `/invoices/${invoice.id}`)}
                    >
                      <TableCell>
                        <div className="flex space-x-3 items-center">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gray-300 text-primary-foreground">
                              {invoice.client_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{invoice.client_name}</p>
                            <p className="text-sm text-muted-foreground">{invoice.client_email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
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
                            {new Date(invoice.due_date) < new Date() && invoice.status === "unpaid" ? "Overdue" : "Due"}
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
                    </TableRow>
                  ))}
                {invoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No invoices found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
