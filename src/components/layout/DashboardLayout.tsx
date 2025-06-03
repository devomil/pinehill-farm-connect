
import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  extraHeaderControls?: React.ReactNode;
}

export function DashboardLayout({ children, requireAdmin = false, extraHeaderControls }: DashboardLayoutProps) {
  const { currentUser, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  console.log("DashboardLayout rendering", {
    isAuthenticated,
    currentUser: currentUser?.name,
    requireAdmin,
    hasExtraControls: !!extraHeaderControls
  });

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (requireAdmin && currentUser?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex h-screen bg-gray-50 w-full">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main 
        className={cn(
          "flex-1 overflow-y-auto relative transition-all duration-200",
          collapsed ? "ml-16" : "ml-64"
        )}
        style={{ 
          padding: '0', 
          margin: '0',
          width: collapsed ? 'calc(100vw - 4rem)' : 'calc(100vw - 16rem)',
          maxWidth: collapsed ? 'calc(100vw - 4rem)' : 'calc(100vw - 16rem)'
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
