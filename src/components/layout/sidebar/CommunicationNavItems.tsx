
import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getCommunicationNavItems, filterNavItemsByRole } from "@/config/navConfig";

interface NavItemProps {
  collapsed: boolean;
}

export const CommunicationNavItems = ({ collapsed }: NavItemProps) => {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  
  const communicationItems = getCommunicationNavItems();
  const filteredItems = filterNavItemsByRole(communicationItems, currentUser?.role);

  return (
    <div className="flex flex-col gap-0.5">
      {filteredItems.map(item => (
        <Button
          key={item.id}
          variant="ghost"
          className={cn(
            "justify-start font-normal h-8 pl-1 pr-2",
            pathname === item.path && "bg-accent"
          )}
          asChild
        >
          <Link to={item.path} className="flex w-full items-center">
            {item.icon}
            <span className={!collapsed ? "block ml-2" : "hidden"}>{item.label}</span>
            {!collapsed && item.badge}
          </Link>
        </Button>
      ))}
    </div>
  );
};
