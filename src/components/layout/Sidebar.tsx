
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMobile";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Settings } from "lucide-react";
import { SidebarBrand } from "./SidebarBrand";
import { SidebarNav } from "./SidebarNav";
import { SidebarMobileSheet } from "./SidebarMobileSheet";
import { SidebarWidthControls } from "./SidebarWidthControls";
import { Button } from "@/components/ui/button";
import { DebugButton } from "@/components/debug/DebugButton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarWidthConfig } from "@/hooks/useSidebarWidth";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  widthConfig: SidebarWidthConfig;
  onWidthConfigChange: (config: Partial<SidebarWidthConfig>) => void;
}

export const Sidebar = ({ collapsed, setCollapsed, widthConfig, onWidthConfigChange }: SidebarProps) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [showWidthControls, setShowWidthControls] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleDebugClick = () => {
    navigate("/diagnostics");
  };

  const getWidthClass = () => {
    const collapsedWidth = widthConfig.collapsed * 0.25;
    const expandedWidth = widthConfig.expanded * 0.25;
    return collapsed ? `w-[${collapsedWidth}rem]` : `w-[${expandedWidth}rem]`;
  };

  if (isMobile) {
    return (
      <SidebarMobileSheet open={open} setOpen={setOpen} handleLogout={handleLogout} />
    );
  }

  return (
    <div
      className="border-r bg-background relative h-screen flex flex-col transition-all z-30"
      style={{
        width: collapsed ? `${widthConfig.collapsed * 0.25}rem` : `${widthConfig.expanded * 0.25}rem`
      }}
    >
      <SidebarBrand collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 overflow-y-auto py-2">
        <SidebarNav collapsed={collapsed} />
      </div>

      <div className="border-t">
        {/* Width Controls */}
        <div className="p-1 border-b">
          <Popover open={showWidthControls} onOpenChange={setShowWidthControls}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start h-8 px-2"
              >
                <Settings className="h-4 w-4" />
                <span className={!collapsed ? "ml-2" : "hidden"}>Width Settings</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent side="right" className="w-auto p-0">
              <SidebarWidthControls
                currentConfig={widthConfig}
                onWidthChange={(config) => {
                  onWidthConfigChange(config);
                  setShowWidthControls(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

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
