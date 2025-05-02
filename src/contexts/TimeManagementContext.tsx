
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { User } from "@/types";
import { TimeManagementContextType, TimeManagementProviderProps } from "@/types/timeManagement";
import { useCommunications } from "@/hooks/useCommunications";
import { useProcessMessages } from "@/hooks/communications/useProcessMessages";
import { useTimeOffRequests } from "@/hooks/timeManagement/useTimeOffRequests";
import { toast } from "sonner";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";

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
    // Create a unique key for this message + type combo
    const toastKey = `${message}-${type}`;
    const now = Date.now();
    
    // Only show a toast if:
    // 1. It's been at least 20 seconds since the last toast
    // 2. This exact message isn't already pending/showing
    if (now - lastToastTime > 20000 && !pendingToasts.current.has(toastKey)) {
      // Add to pending toasts set to prevent duplicates
      pendingToasts.current.add(toastKey);
      
      // Show the toast with the appropriate type
      if (type === 'success') {
        toast.success(message, {
          id: toastKey,
          onDismiss: () => {
            pendingToasts.current.delete(toastKey);
          }
        });
      } else {
        toast.info(message, {
          id: toastKey,
          onDismiss: () => {
            pendingToasts.current.delete(toastKey);
          }
        });
      }
      
      // Update last toast time
      setLastToastTime(now);
      
      // Auto-clear from pending after 20 seconds
      setTimeout(() => {
        pendingToasts.current.delete(toastKey);
      }, 20000);
    } else {
      console.log(`Toast "${message}" suppressed - too soon or duplicate`);
    }
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
    const now = Date.now();
    
    // Prevent multiple refreshes within a short time period
    if (refreshInProgress.current || now - lastRefreshTime < 15000) {
      console.log("Refresh skipped - too soon or already in progress");
      return;
    }
    
    console.log("Force refresh triggered");
    refreshInProgress.current = true;
    setLastRefreshTime(now);
    
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
    handleRetry,
    allEmployees
  };

  return (
    <TimeManagementContext.Provider value={value}>
      {children}
    </TimeManagementContext.Provider>
  );
};
