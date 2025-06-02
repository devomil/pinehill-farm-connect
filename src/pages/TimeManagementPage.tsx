
import React, { useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { TimeManagementProvider } from "@/contexts/timeManagement";
import { TimeManagementContent } from "@/components/time-management/TimeManagementContent";
import { useTimeManagementRefresh } from "@/hooks/timeManagement/useTimeManagementRefresh";

const TimeManagementPage: React.FC = () => {
  const { currentUser } = useAuth();
  const pageLoadRef = useRef(false);
  const { clearAllToasts } = useTimeManagementRefresh();
  
  // When the Time Management page mounts, dismiss any existing toasts
  // that might be lingering from other pages
  useEffect(() => {
    clearAllToasts();
  }, [clearAllToasts]);
  
  // Log page mount
  useEffect(() => {
    if (!pageLoadRef.current && currentUser) {
      console.log("TimeManagement page mounted", {
        currentUser: currentUser ? {
          id: currentUser.id,
          role: currentUser.role
        } : null
      });
      pageLoadRef.current = true;
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <DashboardLayout>
        <div className="p-6">You must be logged in to view this page.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <TimeManagementProvider currentUser={currentUser}>
        <TimeManagementContent currentUser={currentUser} />
      </TimeManagementProvider>
    </DashboardLayout>
  );
};

export default TimeManagementPage;
