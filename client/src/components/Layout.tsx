import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  DollarSign, 
  LayoutDashboard, 
  CreditCard, 
  ArrowLeftRight, 
  Tag, 
  Target, 
  PiggyBank, 
  BarChart3 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Accounts", href: "/accounts", icon: CreditCard },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Categories", href: "/categories", icon: Tag },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Budgets", href: "/budgets", icon: PiggyBank },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">FinanceApp</h1>
        </div>
        
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || 
              (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}>
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white shadow-sm border-r border-gray-200">
        <Sidebar />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white shadow-sm border-b border-gray-200">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
          
          <h1 className="text-lg font-semibold text-gray-900">
            {navigation.find(item => 
              location === item.href || 
              (item.href !== "/" && location.startsWith(item.href))
            )?.name || "Dashboard"}
          </h1>
          
          <div className="w-6"></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
