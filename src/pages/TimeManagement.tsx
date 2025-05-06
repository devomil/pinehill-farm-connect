import React, { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorAlert } from "@/components/time-management/ErrorAlert";
import { TimeManagementHeader } from "@/components/time-management/TimeManagementHeader";
import { TimeManagementTabs } from "@/components/time-management/TimeManagementTabs";
import { TimeManagementProvider, useTimeManagement } from "@/contexts/timeManagement";
import { toast } from "sonner";

export default function TimeManagement() {
  const { currentUser } = useAuth();
  const pageLoadRef = useRef(false);
  
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
        <TimeManagementContent />
      </TimeManagementProvider>
    </DashboardLayout>
  );
}

// Keep TimeManagementContent as a separate component that uses the context
const TimeManagementContent = () => {
  const { currentUser } = useAuth();
  const { error, messagesError, handleRetry, forceRefreshData, allEmployees } = useTimeManagement();
  const initialLoadDone = useRef(false);
  const refreshTimeoutRef = useRef<number | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  useEffect(() => {
    // Guard against undefined currentUser
    if (!currentUser) {
      console.log("TimeManagementContent: currentUser is not available yet");
      return;
    }
    
    console.log("TimeManagementContent rendered with user:", currentUser.id);
    console.log("Available employees count:", allEmployees?.length || 0);
    
    // Log error states
    if (error) console.error("Time-off requests error:", error);
    if (messagesError) console.error("Messages error:", messagesError);

    // Force an initial load but wait a moment to let things settle
    if (!initialLoadDone.current && currentUser) {
      // Clear any existing timeout to prevent multiple refreshes
      if (refreshTimeoutRef.current !== null) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
      
      // Set new timeout
      refreshTimeoutRef.current = window.setTimeout(() => {
        console.log("TimeManagementContent: Initial data refresh");
        forceRefreshData();
        initialLoadDone.current = true;
        refreshTimeoutRef.current = null;
        setIsDataLoaded(true);
      }, 1000);
    }
    
    // Cleanup function
    return () => {
      if (refreshTimeoutRef.current !== null) {
        window.clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [currentUser, error, messagesError, forceRefreshData, allEmployees]);
  
  if (!currentUser) {
    return <div className="p-6">You must be logged in to view this page.</div>;
  }

  const isAdmin = currentUser.role === "admin";
  
  // Display global error message if both requests fail
  const showGlobalError = error && messagesError;

  const handleManualRefresh = () => {
    toast.info("Refreshing time management data...");
    forceRefreshData();
  };

  return (
    <div className="space-y-6">
      {showGlobalError && <ErrorAlert onRetry={handleRetry} />}
      
      <TimeManagementHeader 
        currentUser={currentUser}
        onRefresh={handleManualRefresh}
        onRequestSubmitted={forceRefreshData}
      />
      
      {/* Only render tabs once initial load attempt is done to prevent constant refreshes */}
      {initialLoadDone.current && (
        <TimeManagementTabs 
          currentUser={currentUser}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};
