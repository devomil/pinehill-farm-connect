
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { User } from "@/types";
import { TimeManagementContextType, TimeManagementProviderProps, TimeOffRequest } from "@/types/timeManagement";
import { useCommunications } from "@/hooks/useCommunications";
import { useProcessMessages } from "@/hooks/communications/useProcessMessages";
import { useTimeOffRequests } from "@/hooks/timeManagement/useTimeOffRequests";
import { toast } from "sonner";

const TimeManagementContext = createContext<TimeManagementContextType | undefined>(undefined);

export const useTimeManagement = () => {
  const context = useContext(TimeManagementContext);
  if (context === undefined) {
    throw new Error("useTimeManagement must be used within a TimeManagementProvider");
  }
  return context;
};

export const TimeManagementProvider: React.FC<TimeManagementProviderProps> = ({
  children,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState("my-requests");
  const [retryCount, setRetryCount] = useState(0);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [lastToastTime, setLastToastTime] = useState(0);
  
  useEffect(() => {
    console.log("TimeManagementProvider initialized with user:", currentUser?.id, currentUser?.email);
  }, [currentUser]);
  
  // Get time off requests data
  const {
    timeOffRequests,
    loading,
    error,
    pendingRequests,
    userRequests,
    fetchRequests
  } = useTimeOffRequests(currentUser, retryCount);
  
  // Get communications data for shift coverage requests with enhanced logging
  // Pass false to ensure we include all shift coverage messages
  const { 
    messages: rawMessages, 
    isLoading: messagesLoading, 
    error: messagesError, 
    respondToShiftRequest, 
    refreshMessages 
  } = useCommunications(false);
  
  // Process messages with the enhanced hook
  const processedMessages = useProcessMessages(rawMessages, currentUser);

  // Throttled toast function to prevent excessive notifications
  const showThrottledToast = useCallback((message: string, type: 'success' | 'info' = 'info') => {
    const now = Date.now();
    // Only show a toast if it's been at least 5 seconds since the last one
    if (now - lastToastTime > 5000) {
      if (type === 'success') {
        toast.success(message);
      } else {
        toast.info(message);
      }
      setLastToastTime(now);
    }
  }, [lastToastTime]);

  // Retry logic for failed fetches
  const handleRetry = useCallback(() => {
    console.log("Manual retry triggered");
    setRetryCount(prevCount => prevCount + 1);
    showThrottledToast("Retrying data fetch...");
    fetchRequests();
    refreshMessages();
    return retryCount + 1;
  }, [fetchRequests, refreshMessages, retryCount, showThrottledToast]);

  // Force refresh of data with throttled notifications
  const forceRefreshData = useCallback(() => {
    console.log("Force refresh triggered");
    setRetryCount(prevCount => prevCount + 1);
    
    // Only show toast for manual refreshes, not automatic ones
    if (initialLoadDone) {
      showThrottledToast("Refreshing time management data...");
    }
    
    fetchRequests();
    refreshMessages();
  }, [fetchRequests, refreshMessages, initialLoadDone, showThrottledToast]);
  
  // Initial data load - only once
  useEffect(() => {
    if (currentUser && !initialLoadDone) {
      console.log("Initial data load in TimeManagementProvider for:", currentUser.email);
      fetchRequests();
      refreshMessages();
      setInitialLoadDone(true);
    }
  }, [currentUser, fetchRequests, refreshMessages, initialLoadDone]);

  const value: TimeManagementContextType = {
    timeOffRequests,
    loading,
    error,
    activeTab,
    retryCount,
    pendingRequests,
    userRequests,
    processedMessages,
    messagesLoading,
    messagesError,
    respondToShiftRequest,
    setActiveTab,
    fetchRequests,
    refreshMessages,
    forceRefreshData,
    handleRetry
  };

  return (
    <TimeManagementContext.Provider value={value}>
      {children}
    </TimeManagementContext.Provider>
  );
};
