
import React, { useEffect, useRef } from "react";
import { User } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useTimeManagement } from "@/contexts/timeManagement";
import { ErrorAlert } from "@/components/time-management/ErrorAlert";
import { TimeManagementHeader } from "@/components/time-management/TimeManagementHeader";
import { TimeManagementTabs } from "@/components/time-management/TimeManagementTabs";
import { useTimeManagementRefresh } from "@/hooks/timeManagement/useTimeManagementRefresh";

interface TimeManagementContentProps {
  currentUser: User;
}

export const TimeManagementContent: React.FC<TimeManagementContentProps> = ({ currentUser }) => {
  const { 
    error, 
    messagesError, 
    handleRetry, 
    forceRefreshData, 
    allEmployees, 
    lastSaveTime,
    setLastSaveTime
  } = useTimeManagement();
  
  const { 
    isDataLoaded,
    setupInitialLoad,
    handleManualRefresh,
    cleanupToasts,
    cleanupTimeouts,
    toastIdRef
  } = useTimeManagementRefresh();
  
  // Set up cleanup on mount/unmount
  useEffect(() => {
    if (toastIdRef.current) {
      cleanupToasts();
    }
    
    return () => {
      cleanupToasts();
      cleanupTimeouts();
    };
  }, [cleanupToasts, cleanupTimeouts]);
  
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

    // Force an initial load
    setupInitialLoad(forceRefreshData, currentUser);
    
    // Cleanup function handled by the outer useEffect
  }, [currentUser, error, messagesError, forceRefreshData, allEmployees, setupInitialLoad]);

  if (!currentUser) {
    return <div className="p-6">You must be logged in to view this page.</div>;
  }

  const isAdmin = currentUser.role === "admin";
  
  // Display global error message if both requests fail
  const showGlobalError = error && messagesError;

  // Create a wrapper for the refresh handler
  const refreshHandler = () => {
    handleManualRefresh(forceRefreshData);
  };

  return (
    <div className="space-y-6">
      {showGlobalError && <ErrorAlert onRetry={handleRetry} />}
      
      <TimeManagementHeader 
        currentUser={currentUser}
        onRefresh={refreshHandler}
        onRequestSubmitted={forceRefreshData}
      />
      
      {isDataLoaded && (
        <TimeManagementTabs 
          currentUser={currentUser}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};
