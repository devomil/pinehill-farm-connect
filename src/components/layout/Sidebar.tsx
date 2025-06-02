
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
    // Navigate to the debug/diagnostics page or open debug panel
    navigate("/communication?tab=announcements&debug=true");
  };

  return (
    <div
      className={cn(
        "border-r bg-background relative h-screen flex flex-col transition-all",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarBrand collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="grow overflow-y-auto">
        <SidebarNav collapsed={collapsed} />
      </div>

      <div className="absolute bottom-0 left-0 w-full border-t">
        {/* Debug Button */}
        <div className="p-2 border-b">
          <DebugButton
            onClick={handleDebugClick}
            className="w-full justify-start"
            variant="ghost"
          >
            <span className={!collapsed ? "ml-2" : "hidden"}>Open Diagnostics</span>
          </DebugButton>
        </div>
        
        {/* Logout Button */}
        <Button
          variant="ghost"
          className="justify-start font-normal w-full p-3"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className={!collapsed ? "block" : "hidden"}>Logout</span>
        </Button>
      </div>

      {isMobile && (
        <SidebarMobileSheet open={open} setOpen={setOpen} handleLogout={handleLogout} />
      )}
    </div>
  );
}
