
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  Calendar as CalendarIcon, 
  Home, 
  Inbox, 
  Users, 
  BookOpenCheck,
  BookOpen,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUniqueRoutes } from "@/hooks/useUniqueRoutes";

interface SidebarMobileSheetProps {
  open: boolean;
  setOpen: (o: boolean) => void;
  handleLogout: () => void;
}

export const SidebarMobileSheet = ({
  open,
  setOpen,
  handleLogout
}: SidebarMobileSheetProps) => {
  const { currentUser } = useAuth();
  
  // Define navigation items with unique IDs
  const navigationItemsRaw = [
    {
      id: "dashboard",
      to: "/dashboard",
      icon: <Home className="h-5 w-5 mr-2" />,
      label: "Dashboard",
      showIf: true
    },
    {
      id: "employees",
      to: "/employees",
      icon: <Users className="h-5 w-5 mr-2" />,
      label: "Employees",
      showIf: true
    },
    {
      id: "time",
      to: "/time",
      icon: <CalendarIcon className="h-5 w-5 mr-2" />,
      label: "Time Management",
      showIf: true
    },
    {
      id: "calendar",
      to: "/calendar",
      icon: <CalendarIcon className="h-5 w-5 mr-2" />,
      label: "Calendar",
      showIf: true
    },
    {
      id: "communication",
      to: "/communication",
      icon: <Inbox className="h-5 w-5 mr-2" />,
      label: "Communication",
      showIf: true
    },
    {
      id: "reports",
      to: "/reports",
      icon: <BarChart3 className="h-5 w-5 mr-2" />,
      label: "Reports",
      showIf: true
    },
    {
      id: "training",
      to: "/training",
      icon: <BookOpen className="h-5 w-5 mr-2" />,
      label: "Training Portal",
      showIf: true
    },
    {
      id: "admin-training",
      to: "/admin-training",
      icon: <BookOpenCheck className="h-5 w-5 mr-2" />,
      label: "Training Admin",
      showIf: currentUser?.role === "admin"
    }
  ];

  // Filter visible items first, then deduplicate
  const visibleItems = navigationItemsRaw.filter(item => item.showIf);
  const navigationItems = useUniqueRoutes(visibleItems);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="absolute top-4 right-4">
          Menu
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-3/4">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navigate to different sections of the application.
          </SheetDescription>
        </SheetHeader>
        <nav className="grid gap-4 py-4">
          {navigationItems.map(item => (
            <Button key={item.id} variant="ghost" className="justify-start font-normal">
              <Link to={item.to} className="flex items-center">
                {item.icon}
                {item.label}
              </Link>
            </Button>
          ))}
          <Button variant="ghost" className="justify-start font-normal" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
};
