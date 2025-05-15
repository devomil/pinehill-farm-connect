
import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useUniqueRoutes } from "@/hooks/useUniqueRoutes";
import { toolsNavItems, filterNavItemsByRole } from "@/config/navConfig";

interface NavItemProps {
  collapsed: boolean;
}

export const ToolsNavItems = ({ collapsed }: NavItemProps) => {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  
  // Filter items based on user role, then deduplicate
  const visibleItems = filterNavItemsByRole(toolsNavItems, currentUser?.role);
  const uniqueToolsItems = useUniqueRoutes(visibleItems);

  return (
    <div className="flex flex-col gap-1">
      {uniqueToolsItems.map(item => (
        <Button
          key={item.id}
          variant="ghost"
          className={cn(
            "justify-start font-normal",
            pathname === item.path ? "bg-accent" :
            (pathname.includes("/training") && pathname !== "/admin-training" && item.path === "/training") ? "bg-accent" : ""
          )}
          asChild
        >
          <Link to={item.path} className="flex w-full items-center">
            {item.icon}
            <span className={!collapsed ? "block" : "hidden"}>{item.label}</span>
            {!collapsed && item.badge}
          </Link>
        </Button>
      ))}
    </div>
  );
};
