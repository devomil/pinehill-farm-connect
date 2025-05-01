
import React, { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorAlert } from "@/components/time-management/ErrorAlert";
import { TimeManagementHeader } from "@/components/time-management/TimeManagementHeader";
import { TimeManagementTabs } from "@/components/time-management/TimeManagementTabs";
import { TimeManagementProvider, useTimeManagement } from "@/contexts/TimeManagementContext";

// Internal component that uses the context
const TimeManagementContent = () => {
  const { currentUser } = useAuth();
  const { error, messagesError, handleRetry, forceRefreshData, fetchRequests } = useTimeManagement();
  
  useEffect(() => {
    console.log("TimeManagementContent rendered with user:", currentUser?.id);
    
    // Log error states
    if (error) console.error("Time-off requests error:", error);
    if (messagesError) console.error("Messages error:", messagesError);
  }, [currentUser, error, messagesError]);
  
  if (!currentUser) {
    return <div className="p-6">You must be logged in to view this page.</div>;
  }

  const isAdmin = currentUser.role === "admin";
  
  // Display global error message if both requests fail
  const showGlobalError = error && messagesError;

  return (
    <div className="space-y-6">
      {showGlobalError && <ErrorAlert onRetry={handleRetry} />}
      
      <TimeManagementHeader 
        currentUser={currentUser}
        onRefresh={forceRefreshData}
        onRequestSubmitted={fetchRequests}
      />
      
      <TimeManagementTabs 
        currentUser={currentUser}
        isAdmin={isAdmin}
      />
    </div>
  );
};

// Main component that provides the context
export default function TimeManagement() {
  const { currentUser } = useAuth();
  
  useEffect(() => {
    console.log("TimeManagement page mounted", {
      currentUser: currentUser ? {
        id: currentUser.id,
        role: currentUser.role
      } : null
    });
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
        <TimeManagementContent />
      </TimeManagementProvider>
    </DashboardLayout>
  );
}
