
import React, { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorAlert } from "@/components/time-management/ErrorAlert";
import { TimeManagementHeader } from "@/components/time-management/TimeManagementHeader";
import { TimeManagementTabs } from "@/components/time-management/TimeManagementTabs";
import { TimeManagementProvider, useTimeManagement } from "@/contexts/timeManagement";
import { toast } from "@/hooks/use-toast";
import { User } from "@/types";

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

// Separate inner content component that uses the context after it's provided
const TimeManagementContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    error, 
    messagesError, 
    handleRetry, 
    forceRefreshData, 
    allEmployees, 
    lastSaveTime, 
    setLastSaveTime 
  } = useTimeManagement();
  const initialLoadDone = useRef(false);
  const refreshCountRef = useRef(0);
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

    // Force an initial load but wait longer to let things settle
    if (!initialLoadDone.current && currentUser) {
      // Limit refresh attempts
      if (refreshCountRef.current >= 3) {
        console.log("Maximum initial refresh attempts reached");
        initialLoadDone.current = true;
        setIsDataLoaded(true);
        return;
      }
      
      // Clear any existing timeout to prevent multiple refreshes
      if (refreshTimeoutRef.current !== null) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
      
      // Longer initial delay to ensure everything is ready
      refreshTimeoutRef.current = window.setTimeout(() => {
        console.log("TimeManagementContent: Initial data refresh");
        
        // Track when we last refreshed to prevent rapid re-renders
        const now = Date.now();
        if (now - lastSaveTime < 30000) {
          console.log("Skipping refresh, too soon since last save");
          initialLoadDone.current = true;
          setIsDataLoaded(true);
          refreshTimeoutRef.current = null;
          return;
        }
        
        setLastSaveTime(now);
        refreshCountRef.current++;
        
        forceRefreshData();
        initialLoadDone.current = true;
        refreshTimeoutRef.current = null;
        setIsDataLoaded(true);
      }, 3000); // Much longer delay for initial load
    }
    
    // Cleanup function
    return () => {
      if (refreshTimeoutRef.current !== null) {
        window.clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [currentUser, error, messagesError, forceRefreshData, allEmployees, lastSaveTime, setLastSaveTime]);
  
  if (!currentUser) {
    return <div className="p-6">You must be logged in to view this page.</div>;
  }

  const isAdmin = currentUser.role === "admin";
  
  // Display global error message if both requests fail
  const showGlobalError = error && messagesError;

  const handleManualRefresh = () => {
    // Prevent rapid refreshes
    const now = Date.now();
    if (now - lastSaveTime < 30000) { // 30 second minimum between refreshes
      toast({
        description: "Please wait before refreshing again",
        variant: "default"
      });
      return;
    }
    
    toast({
      description: "Refreshing time management data...",
      variant: "default"
    });
    setLastSaveTime(now);
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
