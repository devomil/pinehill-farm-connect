import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/useMobile";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart3, 
  Calendar as CalendarIcon, 
  ClipboardList, 
  Compass, 
  Home, 
  Inbox, 
  LifeBuoy, 
  LogOut, 
  Settings, 
  Users, 
  BookOpenCheck,
  Clipboard,
  BookOpen 
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div
      className={cn(
        "border-r bg-background relative h-screen flex flex-col transition-all",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center h-20 px-4 shrink-0">
        <Button variant="ghost" onClick={() => setCollapsed(!collapsed)}>
          <Compass className="h-6 w-6 mr-2" />
          {!collapsed && <span>Pinehill Farm</span>}
        </Button>
      </div>
      
      <div className="grow overflow-y-auto">
        <nav className="flex flex-col gap-1 px-2">
          <Button
            variant="ghost"
            className={cn(
              "justify-start font-normal",
              pathname === "/dashboard" && "bg-accent"
            )}
            asChild
          >
            <Link to="/dashboard">
              <Home className="h-5 w-5 mr-3" />
              <span className={!collapsed ? "block" : "hidden"}>Dashboard</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "justify-start font-normal",
              pathname.includes("/employees") && "bg-accent"
            )}
            asChild
          >
            <Link to="/employees">
              <Users className="h-5 w-5 mr-3" />
              <span className={!collapsed ? "block" : "hidden"}>Employees</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "justify-start font-normal",
              pathname.includes("/time") && "bg-accent"
            )}
            asChild
          >
            <Link to="/time">
              <CalendarIcon className="h-5 w-5 mr-3" />
              <span className={!collapsed ? "block" : "hidden"}>Time Management</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "justify-start font-normal",
              pathname.includes("/calendar") && "bg-accent"
            )}
            asChild
          >
            <Link to="/calendar">
              <CalendarIcon className="h-5 w-5 mr-3" />
              <span className={!collapsed ? "block" : "hidden"}>Calendar</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "justify-start font-normal",
              pathname.includes("/communication") && "bg-accent"
            )}
            asChild
          >
            <Link to="/communication">
              <Inbox className="h-5 w-5 mr-3" />
              <span className={!collapsed ? "block" : "hidden"}>Communication</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "justify-start font-normal",
              pathname.includes("/reports") && "bg-accent"
            )}
            asChild
          >
            <Link to="/reports">
              <BarChart3 className="h-5 w-5 mr-3" />
              <span className={!collapsed ? "block" : "hidden"}>Reports</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "justify-start font-normal",
              pathname.includes("/training") && pathname !== "/admin-training" && "bg-accent"
            )}
            asChild
          >
            <Link to="/training">
              <BookOpen className="h-5 w-5 mr-3" />
              <span className={!collapsed ? "block" : "hidden"}>Training Portal</span>
            </Link>
          </Button>

          {currentUser?.role === "admin" && (
            <Button
              variant="ghost"
              className={cn(
                "justify-start font-normal",
                pathname.includes("/admin-training") && "bg-accent"
              )}
              asChild
            >
              <Link to="/admin-training">
                <BookOpenCheck className="h-5 w-5 mr-3" />
                <span className={!collapsed ? "block" : "hidden"}>Training Admin</span>
              </Link>
            </Button>
          )}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 w-full border-t">
        <Button
          variant="ghost"
          className="justify-start font-normal w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className={!collapsed ? "block" : "hidden"}>Logout</span>
        </Button>
      </div>

      {isMobile && (
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
              <Button variant="ghost" className="justify-start font-normal">
                <Link to="/dashboard">
                  <Home className="h-5 w-5 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start font-normal">
                <Link to="/employees">
                  <Users className="h-5 w-5 mr-2" />
                  Employees
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start font-normal">
                <Link to="/time">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Time Management
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start font-normal">
                <Link to="/calendar">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Calendar
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start font-normal">
                <Link to="/communication">
                  <Inbox className="h-5 w-5 mr-2" />
                  Communication
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start font-normal">
                <Link to="/reports">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Reports
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start font-normal">
                <Link to="/training">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Training Portal
                </Link>
              </Button>
              {currentUser?.role === "admin" && (
                <Button variant="ghost" className="justify-start font-normal">
                  <Link to="/admin-training">
                    <BookOpenCheck className="h-5 w-5 mr-2" />
                    Training Admin
                  </Link>
                </Button>
              )}
              <Button variant="ghost" className="justify-start font-normal" onClick={handleLogout}>
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};
