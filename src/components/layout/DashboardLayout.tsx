
import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  extraHeaderControls?: React.ReactNode;
}

export function DashboardLayout({ children, requireAdmin = false, extraHeaderControls }: DashboardLayoutProps) {
  const { currentUser, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (requireAdmin && currentUser?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex h-screen bg-gray-50 w-full">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="flex-1 overflow-y-auto relative">
        {extraHeaderControls && (
          <div className="absolute top-4 right-6 z-10">
            {extraHeaderControls}
          </div>
        )}
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
