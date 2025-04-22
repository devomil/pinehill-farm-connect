
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/useMobile";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";
import { SidebarBrand } from "./SidebarBrand";
import { SidebarNav } from "./SidebarNav";
import { SidebarMobileSheet } from "./SidebarMobileSheet";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
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
        <Button
          variant="ghost"
          className="justify-start font-normal w-full"
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
};
