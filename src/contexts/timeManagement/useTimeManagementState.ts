
import { useState, useCallback, useRef, useEffect } from "react";
import { User } from "@/types";
import { createThrottledToast, shouldAllowRefresh } from "./utils";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useTimeOffRequests } from "@/hooks/timeManagement/useTimeOffRequests";
import { useCommunications } from "@/hooks/useCommunications";
import { useProcessMessages } from "@/hooks/communications/useProcessMessages";

export const useTimeManagementState = (currentUser: User | null) => {
  const [activeTab, setActiveTab] = useState("my-requests");
  const [retryCount, setRetryCount] = useState(0);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [lastToastTime, setLastToastTime] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const pendingToasts = useRef<Set<string>>(new Set());
  const refreshInProgress = useRef<boolean>(false);
  const initialLoadRef = useRef<boolean>(false);
  
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

  // Enhanced toast system with deduplication and throttling
  const showThrottledToast = useCallback((message: string, type: 'success' | 'info' = 'info') => {
    return createThrottledToast(
      pendingToasts.current, 
      setLastToastTime,
      lastToastTime
    )(message, type);
  }, [lastToastTime]);

  // Retry logic for failed fetches
  const handleRetry = useCallback(() => {
    console.log("Manual retry triggered");
    setRetryCount(prevCount => prevCount + 1);
    showThrottledToast("Retrying data fetch...");
    refetchEmployees().then(() => {
      setTimeout(() => {
        fetchRequests();
        refreshMessages();
      }, 1000);
    });
    return retryCount + 1;
  }, [fetchRequests, refreshMessages, retryCount, showThrottledToast, refetchEmployees]);

  // Force refresh of all data with improved handling
  const forceRefreshData = useCallback(() => {
    if (!shouldAllowRefresh(refreshInProgress.current, lastRefreshTime)) {
      return;
    }
    
    console.log("Force refresh triggered");
    refreshInProgress.current = true;
    setLastRefreshTime(Date.now());
    
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
    
    // Reset the refresh lock after a timeout
    setTimeout(() => {
      refreshInProgress.current = false;
    }, 5000);
  }, [fetchRequests, refreshMessages, showThrottledToast, lastRefreshTime, refetchEmployees]);
  
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
  }, [currentUser, fetchRequests, refreshMessages, initialLoadDone, refetchEmployees]);

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
