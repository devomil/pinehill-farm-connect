
import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebarWidth } from "@/hooks/useSidebarWidth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  extraHeaderControls?: React.ReactNode;
}

export function DashboardLayout({ children, requireAdmin = false, extraHeaderControls }: DashboardLayoutProps) {
  const { currentUser, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const { widthConfig, updateWidthConfig, getMainContentStyles } = useSidebarWidth();

  console.log("DashboardLayout rendering", {
    isAuthenticated,
    currentUser: currentUser?.name,
    requireAdmin,
    hasExtraControls: !!extraHeaderControls,
    widthConfig
  });

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (requireAdmin && currentUser?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  const mainContentStyles = getMainContentStyles(collapsed);

  return (
    <div className="flex h-screen bg-gray-50 w-full">
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        widthConfig={widthConfig}
        onWidthConfigChange={updateWidthConfig}
      />
      <main 
        className="flex-1 overflow-y-auto relative transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: mainContentStyles.marginLeft,
          width: mainContentStyles.width,
          maxWidth: mainContentStyles.maxWidth
        }}
      >
        {extraHeaderControls && (
          <div className="absolute top-6 right-6 z-10">
            {extraHeaderControls}
          </div>
        )}
        <div className="w-full h-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
