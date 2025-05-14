
import { useState, useCallback, useEffect } from "react";
import { User } from "@/types";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useTimeOffRequests } from "@/hooks/timeManagement/useTimeOffRequests";
import { useCommunications } from "@/hooks/useCommunications";
import { useProcessMessages } from "@/hooks/communications/useProcessMessages";
import { 
  useRefreshManager,
  useToastManager,
  useInitialLoad,
  useRetryHandler
} from "./hooks";

export const useTimeManagementState = (currentUser: User | null) => {
  // Tab state
  const [activeTab, setActiveTab] = useState("my-requests");
  
  // Hook composition for better organization
  const { showThrottledToast } = useToastManager();
  const { canRefresh, startRefresh } = useRefreshManager();
  const { initialLoadDone, setInitialLoadDone, initialLoadRef } = useInitialLoad(currentUser);
  const { retryCount, setRetryCount, handleRetry } = useRetryHandler(showThrottledToast);
  
  // Fetch employee directory for shift coverage operations
  const { unfilteredEmployees: allEmployees, refetch: refetchEmployees } = useEmployeeDirectory();
  
  useEffect(() => {
    console.log("TimeManagementProvider initialized with user:", currentUser?.id, currentUser?.email);
    console.log("Available employees:", allEmployees?.length || 0);
  }, [currentUser, allEmployees]);
  
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

  // Force refresh of all data with improved handling
  const forceRefreshData = useCallback(() => {
    if (!canRefresh()) {
      return;
    }
    
    console.log("Force refresh triggered");
    startRefresh();
    
    setRetryCount(prevCount => prevCount + 1);
    
    // Only show toast for manual refreshes, not automatic ones
    if (initialLoadRef.current) {
      showThrottledToast("Refreshing time management data...");
    } else {
      console.log("Initial load, not showing refresh toast");
    }
    
    // First refresh employees, then do the rest
    refetchEmployees().then(() => {
      setTimeout(() => {
        fetchRequests();
        refreshMessages();
      }, 1000);
    });
    
  }, [fetchRequests, refreshMessages, showThrottledToast, canRefresh, startRefresh, refetchEmployees, setRetryCount, initialLoadRef]);
  
  // Initial data load - only once
  useEffect(() => {
    if (currentUser && !initialLoadDone) {
      console.log("Initial data load in TimeManagementProvider for:", currentUser.email);
      // First fetch employees
      refetchEmployees().then(() => {
        setTimeout(() => {
          fetchRequests();
          refreshMessages();
        }, 1000);
      });
      setInitialLoadDone(true);
      
      // Set initialLoadRef to true after a delay
      setTimeout(() => {
        initialLoadRef.current = true;
      }, 5000);
    }
  }, [currentUser, fetchRequests, refreshMessages, initialLoadDone, refetchEmployees, setInitialLoadDone, initialLoadRef]);

  return {
    // State
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
    allEmployees,
    
    // Actions
    respondToShiftRequest,
    setActiveTab,
    fetchRequests,
    refreshMessages,
    forceRefreshData,
    handleRetry
  };
};
