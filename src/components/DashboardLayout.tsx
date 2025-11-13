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
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Settings, HelpCircle, LogOut, Search, Bell } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import logo from "@/assets/logo.png";
import icon from "@/assets/icon.png";
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

function SidebarLogo() {
  const { state } = useSidebar();

  return (
    <SidebarHeader className="px-3 py-5">
      {state === "expanded" ? (
        <img src={logo} alt="Maglo" className="w-28 object-contain" />
      ) : (
        <img src={icon} alt="Maglo" className="h-8 w-8 object-contain" />
      )}
    </SidebarHeader>
  );
}

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
      {/* Remove the border-red-600 and overflow-hidden, add flex-col */}
      <div className="flex min-h-screen w-full flex-col md:flex-row">
        {/* Sidebar - Control width based on state */}
        <Sidebar collapsible="icon" className="md:fixed md:inset-y-0 md:z-50 md:flex">
          <SidebarLogo />

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink to={item.url} className="flex items-center gap-3 px-4 py-5" activeClassName="bg-primary text-primary-foreground">
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

          <SidebarFooter className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Help">
                  <button className="flex items-center gap-3 w-full text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-5 w-5" />
                    <span>Help</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Logout">
                  <button onClick={() => signOut()} className="flex items-center gap-3 w-full text-muted-foreground hover:text-foreground">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content - Dynamic width based on sidebar state */}
        <SidebarInset className="flex-1 min-w-0">
          <header className="h-16 bg-card w-full flex items-center justify-between px-4 lg:px-6 border-b flex-shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:bg-transparent transition-all duration-200" aria-label="Toggle Sidebar" />
              <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
            </div>

            <div className="flex items-center gap-3 lg:gap-4">
              <div className="flex items-center gap-1 lg:gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground h-9 w-9 lg:h-10 lg:w-10">
                  <Search className="h-4 w-4 lg:h-5 lg:w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground h-9 w-9 lg:h-10 lg:w-10">
                  <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center px-1 bg-gray-100 border rounded-full h-9 lg:h-10">
                    <Avatar className="h-6 w-6 lg:h-8 lg:w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gray-300 text-primary-foreground text-xs lg:text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm lg:block hidden font-medium ml-2">{user?.name?.split("@")[0]}</span>
                    <RiArrowDownSFill className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
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

          <main className="flex-1 bg-card p-4 lg:p-6 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
