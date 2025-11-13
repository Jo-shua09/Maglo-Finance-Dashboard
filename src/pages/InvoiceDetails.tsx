import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { databases, databaseId, collectionId } from "@/integrations/appwrite/client";
import { toast } from "sonner";
import icon from "@/assets/icon.png";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState<Partial<Invoice>>({});

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await databases.getDocument(databaseId, collectionId, id!);
      setInvoice({
        id: res.$id,
        client_name: res.client_name,
        client_email: res.client_email,
        amount: res.amount,
        vat_percentage: res.vat_percentage,
        vat_amount: res.vat_amount,
        total_amount: res.total_amount,
        due_date: res.due_date,
        status: res.status,
        created_at: res.created_at,
        items: res.items,
      });
    } catch (error) {
      toast.error("Failed to load invoice");
    }
  };

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-20">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-4">
            New Invoice: <span className="text-primary">MGL{invoice.id ? invoice.id.slice(-6) : ""}</span>
          </h2>

          <Card className="md:p-6 p-3 rounded-2xl shadow-sm border">
            <div className="flex justify-between items-center bg-foreground text-white px-3 py-6 md:p-6 rounded-xl mb-6">
              <div className="flex gap-2 items-center">
                <img src={icon} alt="" />
                <div>
                  <h3 className="font-semibold text-base md:text-lg">Maglo</h3>
                  <p className="text-sm">sales@maglo.com</p>
                </div>
              </div>
              <div className="text-right text-xs md:text-sm">
                <p>1333 Grey Fox Farm Road</p>
                <p>Houston, TX 77060</p>
                <p>Bloomfield Hills, Michigan(MI), 48301</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Invoice Number</h4>
                <p className="text-sm">MGL{invoice.id ? invoice.id.slice(-6) : ""}</p>
                <p className="text-sm mt-2">
                  <strong>Issued:</strong> {new Date(invoice.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  <strong>Due:</strong> {new Date(invoice.due_date).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Billed To</h4>
                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Client Name</Label>
                    <Input
                      id="client_name"
                      value={editedInvoice.client_name || ""}
                      onChange={(e) => setEditedInvoice({ ...editedInvoice, client_name: e.target.value })}
                    />
                    <Label htmlFor="client_email">Client Email</Label>
                    <Input
                      id="client_email"
                      type="email"
                      value={editedInvoice.client_email || ""}
                      onChange={(e) => setEditedInvoice({ ...editedInvoice, client_email: e.target.value })}
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-medium">{invoice.client_name}</p>
                    <p className="text-sm">{invoice.client_email}</p>
                  </>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Item Details</h4>
              <table className="w-full text-sm">
                <thead className="text-muted-foreground border-b">
                  <tr>
                    <th className="text-left py-2">ITEM</th>
                    <th>ORDER/TYPE</th>
                    <th>RATE</th>
                    <th>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2">{item.name}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-center">${item.rate}</td>
                      <td className="text-right">${item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mt-4">
                <div className="w-64 space-y-1 text-right text-sm">
                  <p>
                    <strong>Subtotal:</strong> ${invoice.amount.toFixed(2)}
                  </p>
                  <p>
                    <strong>VAT:</strong> ${invoice.vat_amount.toFixed(2)}
                  </p>
                  <p className="font-semibold text-lg mt-2">Total: ${invoice.total_amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-96 space-y-4 md:mt-10">
          <Card className="p-6 rounded-2xl shadow-sm">
            <CardContent className="space-y-3 p-0">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" />
                  <AvatarFallback>{invoice.client_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{invoice.client_name}</p>
                  <p className="text-xs text-muted-foreground">{invoice.client_email}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-3">
                Add Customer
              </Button>
            </CardContent>
          </Card>

          <Card className="p-6 rounded-2xl shadow-sm">
            <CardContent className="p-0">
              <p className="text-sm mb-1 font-medium">Invoice Date</p>
              <p className="text-sm mb-3">{new Date(invoice.created_at).toLocaleDateString()}</p>

              <p className="text-sm mb-1 font-medium">Due Date</p>
              <p className="text-sm mb-3">{new Date(invoice.due_date).toLocaleDateString()}</p>

              <Button className="w-full bg-[#c1f437] text-black hover:bg-[#aee927] font-semibold">Send Invoice</Button>

              <div className="flex justify-between mt-3">
                <Button variant="outline" className="w-[48%]">
                  Preview
                </Button>
                <Button variant="outline" className="w-[48%]">
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
