
import React from "react";
import { Button } from "@/components/ui/button";
import { Compass, Menu } from "lucide-react";

interface SidebarBrandProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const SidebarBrand = ({ collapsed, setCollapsed }: SidebarBrandProps) => (
  <div className="flex items-center h-14 px-2 shrink-0 border-b bg-gray-50/50">
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => setCollapsed(!collapsed)} 
      className="p-2 hover:bg-gray-100"
    >
      <Menu className="h-4 w-4" />
      {!collapsed && <span className="ml-2 font-semibold text-sm">Pinehill</span>}
    </Button>
  </div>
);
