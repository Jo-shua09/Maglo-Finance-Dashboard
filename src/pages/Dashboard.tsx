import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { databases, databaseId, collectionId } from "@/integrations/appwrite/client";
import { Query } from "appwrite";
import { FaWallet } from "react-icons/fa6";

interface Invoice {
  id: string;
  total_amount: number;
  vat_amount: number;
  status: string;
  due_date: string;
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
        total_amount: doc.total_amount,
        vat_amount: doc.vat_amount,
        status: doc.status,
        due_date: doc.due_date,
      }));

      setInvoices(fetchedInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      // Fallback to mock data if database fails
      const mockInvoices: Invoice[] = [
        {
          id: "1",
          total_amount: 1075,
          vat_amount: 75,
          status: "unpaid",
          due_date: "2024-12-31",
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-foreground rounded-xl border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/20 p-2">
                  <FaWallet className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Total Invoices</div>
                  <div className="text-2xl font-bold text-white">${totalInvoices}</div>
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
      </div>
    </DashboardLayout>
  );
}
