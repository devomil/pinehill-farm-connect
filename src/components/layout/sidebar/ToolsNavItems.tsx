
import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toolsNavItems, filterNavItemsByRole } from "@/config/navConfig";

interface NavItemProps {
  collapsed: boolean;
}

export const ToolsNavItems = ({ collapsed }: NavItemProps) => {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  
  // Filter items based on user role
  const visibleItems = filterNavItemsByRole(toolsNavItems, currentUser?.role);
  
  // Deduplicate items by path
  const uniqueItemsMap = new Map();
  visibleItems.forEach(item => {
    const basePath = item.path.split('?')[0];
    
    // Explicitly skip any "/communications" plural path and "/calendar" path
    if (basePath === "/communications" || basePath === "/calendar") {
      return;
    }
    
    if (!uniqueItemsMap.has(basePath)) {
      uniqueItemsMap.set(basePath, item);
    }
  });
  
  const uniqueNavItems = Array.from(uniqueItemsMap.values());

  return (
    <div className="flex flex-col gap-1">
      {uniqueNavItems.map(item => (
        <Button
          key={item.id}
          variant="ghost"
          className={cn(
            "justify-start font-normal",
            pathname === item.path && "bg-accent"
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
}
