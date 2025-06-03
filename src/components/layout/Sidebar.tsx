
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMobile";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";
import { SidebarBrand } from "./SidebarBrand";
import { SidebarNav } from "./SidebarNav";
import { SidebarMobileSheet } from "./SidebarMobileSheet";
import { Button } from "@/components/ui/button";
import { DebugButton } from "@/components/debug/DebugButton";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleDebugClick = () => {
    // Navigate to the global diagnostics page
    navigate("/diagnostics");
  };

  if (isMobile) {
    return (
      <SidebarMobileSheet open={open} setOpen={setOpen} handleLogout={handleLogout} />
    );
  }

  return (
    <div
      className={cn(
        "border-r bg-background relative h-screen flex flex-col transition-all z-30",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarBrand collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 overflow-y-auto py-2">
        <SidebarNav collapsed={collapsed} />
      </div>

      <div className="border-t">
        {/* Debug Button */}
        <div className="p-1 border-b">
          <DebugButton
            onClick={handleDebugClick}
            className="w-full justify-start h-8 px-2"
            variant="ghost"
          >
            <span className={!collapsed ? "ml-2" : "hidden"}>Open Diagnostics</span>
          </DebugButton>
        </div>
        
        {/* Logout Button */}
        <Button
          variant="ghost"
          className="justify-start font-normal w-full h-8 px-2 m-1"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className={!collapsed ? "block ml-2" : "hidden"}>Logout</span>
        </Button>
      </div>
    </div>
  );
}
