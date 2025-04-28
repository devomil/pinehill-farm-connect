
import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  CalendarIcon, 
  Home, 
  Inbox, 
  MessageSquare,
  Users, 
  BookOpenCheck,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarNavProps {
  collapsed: boolean;
}

export const SidebarNav = ({ collapsed }: SidebarNavProps) => {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();

  return (
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

      {currentUser?.role === "admin" && (
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
      )}

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
          pathname === "/communication" && "bg-accent"
        )}
        asChild
      >
        <Link to="/communication">
          <Inbox className="h-5 w-5 mr-3" />
          <span className={!collapsed ? "block" : "hidden"}>Announcements</span>
        </Link>
      </Button>

      <Button
        variant="ghost"
        className={cn(
          "justify-start font-normal",
          pathname === "/communications" && "bg-accent"
        )}
        asChild
      >
        <Link to="/communications">
          <MessageSquare className="h-5 w-5 mr-3" />
          <span className={!collapsed ? "block" : "hidden"}>Messaging</span>
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
  );
};
