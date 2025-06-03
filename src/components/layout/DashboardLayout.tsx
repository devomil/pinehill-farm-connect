
import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebarWidth } from "@/hooks/useSidebarWidth";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  extraHeaderControls?: React.ReactNode;
}

export function DashboardLayout({ children, requireAdmin = false, extraHeaderControls }: DashboardLayoutProps) {
  const { currentUser, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const { widthConfig, updateWidthConfig, getMainContentStyles } = useSidebarWidth();
  const responsive = useResponsiveLayout();

  console.log("DashboardLayout rendering", {
    isAuthenticated,
    currentUser: currentUser?.name,
    requireAdmin,
    hasExtraControls: !!extraHeaderControls,
    widthConfig,
    responsive
  });

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (requireAdmin && currentUser?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  const mainContentStyles = getMainContentStyles(collapsed);

  // Auto-collapse sidebar on mobile/tablet
  const shouldCollapse = responsive.isMobile || responsive.isTablet || collapsed;

  return (
    <div className="flex h-screen bg-gray-50 w-full">
      <Sidebar 
        collapsed={shouldCollapse} 
        setCollapsed={setCollapsed}
        widthConfig={widthConfig}
        onWidthConfigChange={updateWidthConfig}
      />
      <main 
        className="flex-1 overflow-y-auto relative transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: responsive.isMobile ? '0' : mainContentStyles.marginLeft,
          width: responsive.isMobile ? '100%' : mainContentStyles.width,
          maxWidth: responsive.isMobile ? '100%' : mainContentStyles.maxWidth
        }}
      >
        {extraHeaderControls && (
          <div className="absolute top-6 right-6 z-10">
            {extraHeaderControls}
          </div>
        )}
        <div 
          className={cn(
            "w-full h-full mx-auto px-4 sm:px-6 lg:px-8 py-6",
            responsive.isExtraLarge && "px-12 py-8"
          )}
          style={{
            maxWidth: responsive.containerMaxWidth
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
