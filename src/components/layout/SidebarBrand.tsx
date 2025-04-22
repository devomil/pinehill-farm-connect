
import React from "react";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

interface SidebarBrandProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const SidebarBrand = ({ collapsed, setCollapsed }: SidebarBrandProps) => (
  <div className="flex items-center h-20 px-4 shrink-0">
    <Button variant="ghost" onClick={() => setCollapsed(!collapsed)}>
      <Compass className="h-6 w-6 mr-2" />
      {!collapsed && <span>Pinehill Farm</span>}
    </Button>
  </div>
);
