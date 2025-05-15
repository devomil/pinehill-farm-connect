
import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BarChart3, BookOpen, BookOpenCheck, Image } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUniqueRoutes } from "@/hooks/useUniqueRoutes";

interface NavItemProps {
  collapsed: boolean;
}

export const ToolsNavItems = ({ collapsed }: NavItemProps) => {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  
  const toolsItemsRaw = [
    {
      id: "reports",
      to: "/reports",
      icon: <BarChart3 className="h-5 w-5 mr-3" />,
      label: "Reports",
      showIf: true,
      badge: null,
    },
    {
      id: "marketing",
      to: "/marketing",
      icon: <Image className="h-5 w-5 mr-3" />,
      label: "Marketing",
      showIf: true,
      badge: null,
    },
    {
      id: "training",
      to: "/training",
      icon: <BookOpen className="h-5 w-5 mr-3" />,
      label: "Training Portal",
      showIf: true,
      badge: null,
    },
    {
      id: "admin-training",
      to: "/admin-training",
      icon: <BookOpenCheck className="h-5 w-5 mr-3" />,
      label: "Training Admin",
      showIf: currentUser?.role === "admin",
      badge: null,
    }
  ];

  // Filter visible items first, then deduplicate
  const visibleItems = toolsItemsRaw.filter(item => item.showIf);
  const toolsItems = useUniqueRoutes(visibleItems);

  return (
    <div className="flex flex-col gap-1">
      {toolsItems.map(item => (
        <Button
          key={item.id}
          variant="ghost"
          className={cn(
            "justify-start font-normal",
            pathname === item.to ? "bg-accent" :
            (pathname.includes("/training") && pathname !== "/admin-training" && item.to === "/training") ? "bg-accent" : ""
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
