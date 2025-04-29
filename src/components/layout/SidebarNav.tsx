
import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  CalendarIcon, 
  Home, 
  Megaphone, 
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

  // Group for main navigation
  const mainNavItems = [
    {
      to: "/dashboard",
      icon: <Home className="h-5 w-5 mr-3" />,
      label: "Dashboard",
      showIf: true,
    },
    {
      to: "/employees",
      icon: <Users className="h-5 w-5 mr-3" />,
      label: "Employees",
      showIf: currentUser?.role === "admin",
    },
    {
      to: "/time",
      icon: <CalendarIcon className="h-5 w-5 mr-3" />,
      label: "Time Management",
      showIf: true,
    }
  ];

  // Group for communication features
  const communicationItems = [
    {
      to: "/communication",
      icon: <Megaphone className="h-5 w-5 mr-3" />,
      label: "Announcements",
      showIf: true,
    },
    {
      to: "/communications",
      icon: <MessageSquare className="h-5 w-5 mr-3" />,
      label: "Direct Messages",
      showIf: true,
    }
  ];

  // Group for reporting and training
  const toolsItems = [
    {
      to: "/reports",
      icon: <BarChart3 className="h-5 w-5 mr-3" />,
      label: "Reports",
      showIf: true,
    },
    {
      to: "/training",
      icon: <BookOpen className="h-5 w-5 mr-3" />,
      label: "Training Portal",
      showIf: true,
    },
    {
      to: "/admin-training",
      icon: <BookOpenCheck className="h-5 w-5 mr-3" />,
      label: "Training Admin",
      showIf: currentUser?.role === "admin",
    }
  ];

  return (
    <nav className="flex flex-col gap-4 px-2">
      {/* Main navigation group */}
      <div className="flex flex-col gap-1">
        {mainNavItems.map(item => 
          item.showIf && (
            <Button
              key={item.to}
              variant="ghost"
              className={cn(
                "justify-start font-normal",
                pathname === item.to && "bg-accent"
              )}
              asChild
            >
              <Link to={item.to}>
                {item.icon}
                <span className={!collapsed ? "block" : "hidden"}>{item.label}</span>
              </Link>
            </Button>
          )
        )}
      </div>
      
      {/* Communication group with separator */}
      <div>
        {!collapsed && (
          <div className="px-3 mb-1">
            <p className="text-xs font-semibold text-muted-foreground">COMMUNICATION</p>
          </div>
        )}
        <div className="flex flex-col gap-1">
          {communicationItems.map(item => 
            item.showIf && (
              <Button
                key={item.to}
                variant="ghost"
                className={cn(
                  "justify-start font-normal",
                  pathname === item.to && "bg-accent"
                )}
                asChild
              >
                <Link to={item.to}>
                  {item.icon}
                  <span className={!collapsed ? "block" : "hidden"}>{item.label}</span>
                </Link>
              </Button>
            )
          )}
        </div>
      </div>

      {/* Tools group with separator */}
      <div>
        {!collapsed && (
          <div className="px-3 mb-1">
            <p className="text-xs font-semibold text-muted-foreground">TOOLS</p>
          </div>
        )}
        <div className="flex flex-col gap-1">
          {toolsItems.map(item => 
            item.showIf && (
              <Button
                key={item.to}
                variant="ghost"
                className={cn(
                  "justify-start font-normal",
                  pathname.includes(item.to) && item.to !== "/training" ? "bg-accent" :
                  (pathname.includes("/training") && pathname !== "/admin-training" && item.to === "/training") ? "bg-accent" : ""
                )}
                asChild
              >
                <Link to={item.to}>
                  {item.icon}
                  <span className={!collapsed ? "block" : "hidden"}>{item.label}</span>
                </Link>
              </Button>
            )
          )}
        </div>
      </div>
    </nav>
  );
};
