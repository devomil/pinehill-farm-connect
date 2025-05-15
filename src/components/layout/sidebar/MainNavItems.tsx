
import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Users, CalendarIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUniqueRoutes } from "@/hooks/useUniqueRoutes";

interface NavItemProps {
  collapsed: boolean;
}

export const MainNavItems = ({ collapsed }: NavItemProps) => {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  
  // Define main nav items with unique IDs
  const mainNavItemsRaw = [
    {
      id: "dashboard",
      to: "/dashboard",
      icon: <Home className="h-5 w-5 mr-3" />,
      label: "Dashboard",
      showIf: true,
      badge: null,
    },
    {
      id: "employees",
      to: "/employees",
      icon: <Users className="h-5 w-5 mr-3" />,
      label: "Employees",
      showIf: currentUser?.role === "admin",
      badge: null,
    },
    {
      id: "time",
      to: "/time",
      icon: <CalendarIcon className="h-5 w-5 mr-3" />,
      label: "Time Management",
      showIf: true,
      badge: null,
    }
  ];

  // Filter visible items first, then deduplicate
  const visibleItems = mainNavItemsRaw.filter(item => item.showIf);
  const mainNavItems = useUniqueRoutes(visibleItems);

  return (
    <div className="flex flex-col gap-1">
      {mainNavItems.map(item => (
        <Button
          key={item.id}
          variant="ghost"
          className={cn(
            "justify-start font-normal",
            pathname === item.to && "bg-accent"
          )}
          asChild
        >
          <Link to={item.to} className="flex w-full items-center">
            {item.icon}
            <span className={!collapsed ? "block" : "hidden"}>{item.label}</span>
            {!collapsed && item.badge}
          </Link>
        </Button>
      ))}
    </div>
  );
};
