
import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toolsNavItems, filterNavItemsByRole } from "@/config/navConfig";
import { NavigationService } from "@/services/navigationService";

interface NavItemProps {
  collapsed: boolean;
}

export const ToolsNavItems = ({ collapsed }: NavItemProps) => {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  
  // Filter items based on user role and apply full processing pipeline
  const roleFilteredItems = filterNavItemsByRole(toolsNavItems, currentUser?.role);
  const processedNavItems = NavigationService.processNavigationItems(roleFilteredItems);

  console.log(`Tools navigation: Processing ${toolsNavItems.length} tools items, ${roleFilteredItems.length} after role filter, ${processedNavItems.length} final items`);

  return (
    <div className="flex flex-col gap-1">
      {processedNavItems.map(item => (
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
