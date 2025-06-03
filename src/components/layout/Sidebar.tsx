
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

  // Calculate widths in rem for consistency
  const collapsedWidthRem = widthConfig.collapsed * 0.25;
  const expandedWidthRem = widthConfig.expanded * 0.25;
  const currentWidthRem = collapsed ? collapsedWidthRem : expandedWidthRem;

  if (isMobile) {
    return (
      <SidebarMobileSheet open={open} setOpen={setOpen} handleLogout={handleLogout} />
    );
  }

  return (
    <div
      className="border-r bg-background relative h-screen flex flex-col transition-all duration-300 ease-in-out z-30 shrink-0"
      style={{
        width: `${currentWidthRem}rem`,
        minWidth: `${currentWidthRem}rem`,
        maxWidth: `${currentWidthRem}rem`
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
                className={cn(
                  "w-full h-8 pl-1 pr-2 transition-all duration-200",
                  collapsed ? "justify-center" : "justify-start"
                )}
              >
                <Settings className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="ml-2 truncate">Width Settings</span>}
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
            className={cn(
              "w-full h-8 pl-1 pr-2 transition-all duration-200",
              collapsed ? "justify-center" : "justify-start"
            )}
            variant="ghost"
          >
            {!collapsed && <span className="ml-2 truncate">Diagnostics</span>}
          </DebugButton>
        </div>
        
        {/* Logout Button */}
        <div className="p-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full h-8 pl-1 pr-2 transition-all duration-200",
              collapsed ? "justify-center" : "justify-start"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="ml-2 truncate">Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
