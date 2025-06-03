
import React from "react";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

interface SidebarBrandProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const SidebarBrand = ({ collapsed, setCollapsed }: SidebarBrandProps) => (
  <div className="flex items-center h-16 px-3 shrink-0">
    <Button variant="ghost" onClick={() => setCollapsed(!collapsed)} className="p-2">
      <Compass className="h-5 w-5" />
      {!collapsed && <span className="ml-2 text-sm">Pinehill Farm</span>}
    </Button>
  </div>
);
