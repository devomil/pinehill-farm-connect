
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
  useRetryHandler,
  useDaySelector
} from "./hooks";

export const useTimeManagementState = (currentUser: User | null) => {
  // Tab state
  const [activeTab, setActiveTab] = useState("my-requests");
  
  // Hook composition for better organization
  const { showThrottledToast } = useToastManager();
  const { canRefresh, startRefresh } = useRefreshManager();
  const { initialLoadDone, setInitialLoadDone, initialLoadRef } = useInitialLoad(currentUser);
  const { retryCount, setRetryCount, handleRetry } = useRetryHandler(showThrottledToast);
  
  // Day selector hook for calendar functionality
  const daySelector = useDaySelector();
  
  // Track last save time to prevent rapid re-saves
  const [lastSaveTime, setLastSaveTime] = useState<number>(0);
  
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
  
  // Get communications data for shift coverage requests with reduced frequency
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

  // Force refresh of all data with improved handling and rate limiting
  const forceRefreshData = useCallback(() => {
    const now = Date.now();
    const MIN_REFRESH_INTERVAL = 30000; // 30 seconds minimum between refreshes
    
    if (now - lastSaveTime < MIN_REFRESH_INTERVAL) {
      console.log(`Skipping refresh, too soon (${Math.round((now - lastSaveTime) / 1000)}s < ${MIN_REFRESH_INTERVAL / 1000}s)`);
      showThrottledToast("Please wait before refreshing again");
      return;
    }
    
    if (!canRefresh()) {
      return;
    }
    
    console.log("Force refresh triggered");
    startRefresh();
    setLastSaveTime(now);
    
    setRetryCount(prevCount => prevCount + 1);
    
    // Only show toast for manual refreshes, not automatic ones
    if (initialLoadRef.current) {
      showThrottledToast("Refreshing time management data...");
    } else {
      console.log("Initial load, not showing refresh toast");
    }
    
    // First refresh employees, then do the rest with delay to prevent race conditions
    refetchEmployees().then(() => {
      setTimeout(() => {
        fetchRequests();
        // Add more delay to prevent overloading
        setTimeout(() => {
          refreshMessages();
        }, 2000);
      }, 2000);
    });
    
  }, [fetchRequests, refreshMessages, showThrottledToast, canRefresh, 
      startRefresh, refetchEmployees, setRetryCount, initialLoadRef, lastSaveTime]);
  
  // Initial data load - only once and with improved sequencing
  useEffect(() => {
    if (currentUser && !initialLoadDone) {
      console.log("Initial data load in TimeManagementProvider for:", currentUser.email);
      
      // Set loading state immediately
      setLastSaveTime(Date.now());
      
      // Sequential loading with delays to prevent race conditions
      setTimeout(() => {
        refetchEmployees().then(() => {
          setTimeout(() => {
            fetchRequests();
            setTimeout(() => {
              refreshMessages();
            }, 2000);
          }, 2000);
        });
      }, 1000);
      
      setInitialLoadDone(true);
      
      // Set initialLoadRef to true after a delay
      setTimeout(() => {
        initialLoadRef.current = true;
      }, 10000); // Longer delay for initial load reference
    }
  }, [currentUser, fetchRequests, refreshMessages, initialLoadDone, 
      refetchEmployees, setInitialLoadDone, initialLoadRef]);

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
    daySelector, // Export the day selector hook
    lastSaveTime,
    
    // Actions
    respondToShiftRequest,
    setActiveTab,
    fetchRequests,
    refreshMessages,
    forceRefreshData,
    handleRetry,
    setLastSaveTime
  };
};
