import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Settings, HelpCircle, LogOut, Search, Bell } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import logo from "@/assets/logo.png";
import { RiArrowDownSFill } from "react-icons/ri";
import { GoHomeFill } from "react-icons/go";
import { FaArrowTrendUp, FaWallet } from "react-icons/fa6";
import { TbInvoice } from "react-icons/tb";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: GoHomeFill },
  { title: "Transactions", url: "/transactions", icon: FaArrowTrendUp },
  { title: "Invoices", url: "/invoices", icon: TbInvoice },
  { title: "My Wallets", url: "/wallets", icon: FaWallet },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { signOut, user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path === "/invoices") return "Invoices";
    if (path.startsWith("/invoices/")) return "Invoice Details";
    if (path === "/transactions") return "Transactions";
    if (path === "/wallets") return "My Wallets";
    if (path === "/settings") return "Settings";
    return "Dashboard";
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="px-1">
          <div className="px-4 py-6">
            <img src={logo} alt="Maglo" className="h-8 w-auto" />
          </div>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className="flex items-center gap-3 px-4 py-5 text-muted-foreground hover:text-foreground transition-colors"
                          activeClassName="bg-primary text-primary-foreground rounded-lg font-medium"
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 space-y-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground transition-colors w-full">
                    <HelpCircle className="h-5 w-5" />
                    <span>Help</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground transition-colors w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="h-16 bg-card flex items-center justify-between px-6">
            <h1 className="text-xl font-semibold">{getPageTitle()}</h1>

            <div className="flex items-center gap-4">
              <div>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Search className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Bell className="h-5 w-5" />
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center px-1 bg-gray-100 border rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gray-300 text-primary-foreground">{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user?.email?.split("@")[0]}</span>
                    <RiArrowDownSFill className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 bg-card p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
