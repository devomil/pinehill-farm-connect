
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
        className="flex-1 overflow-y-auto relative transition-all duration-200"
        style={{ 
          padding: '0', 
          margin: '0',
          marginLeft: mainContentStyles.marginLeft,
          width: mainContentStyles.width,
          maxWidth: mainContentStyles.maxWidth
        }}
      >
        {extraHeaderControls && (
          <div className="absolute top-4 right-6 z-10">
            {extraHeaderControls}
          </div>
        )}
        <div className="w-full h-full max-w-none" style={{ padding: '1.5rem', margin: '0' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
