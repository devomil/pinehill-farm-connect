
import React from "react";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

interface SidebarBrandProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const SidebarBrand = ({ collapsed, setCollapsed }: SidebarBrandProps) => (
  <div className="flex items-center h-12 px-2 shrink-0">
    <Button variant="ghost" onClick={() => setCollapsed(!collapsed)} className="p-1">
      <Compass className="h-4 w-4" />
      {!collapsed && <span className="ml-1 text-xs">Pinehill</span>}
    </Button>
  </div>
);
