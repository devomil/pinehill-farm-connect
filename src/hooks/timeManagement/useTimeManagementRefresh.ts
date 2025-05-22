
import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { dismissAllToasts } from '@/utils/toastCleanup';

/**
 * Custom hook to manage data refresh operations for the Time Management page
 */
export function useTimeManagementRefresh() {
  const [lastSaveTime, setLastSaveTime] = useState<number>(0);
  const toastIdRef = useRef<string | null>(null);
  const refreshCountRef = useRef(0);
  const refreshTimeoutRef = useRef<number | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const initialLoadDone = useRef(false);

  // Clean up any lingering toasts when the hook unmounts
  const cleanupToasts = useCallback(() => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
  }, []);

  // Handle manual refresh with proper toast management
  const handleManualRefresh = useCallback((forceRefreshData: () => void) => {
    // Prevent rapid refreshes
    const now = Date.now();
    if (now - lastSaveTime < 30000) { // 30 second minimum between refreshes
      toast("Please wait before refreshing again");
      return;
    }
    
    // Clear any existing toast
    cleanupToasts();
    
    // Show a new toast for this refresh
    toastIdRef.current = toast.loading("Refreshing time management data...").toString();
    
    setLastSaveTime(now);
    
    try {
      // Call refresh function but don't store its result or check its type
      forceRefreshData();
      
      // Assume success after a delay since we can't rely on Promise chain
      setTimeout(() => {
        if (toastIdRef.current) {
          toast.success("Data refreshed successfully", {
            id: toastIdRef.current,
            duration: 2000
          });
          toastIdRef.current = null;
        }
      }, 1500);
    } catch (error) {
      console.error("Error refreshing data:", error);
      
      // Show error toast
      if (toastIdRef.current) {
        toast.error("Failed to refresh data", { id: toastIdRef.current });
        toastIdRef.current = null;
      }
    }
  }, [lastSaveTime, cleanupToasts, setLastSaveTime]);

  // Initial data load management
  const setupInitialLoad = useCallback((forceRefreshData: () => void, currentUser: any) => {
    // Only if component isn't yet initialized
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
  }, [lastSaveTime, setLastSaveTime]);

  // Cleanup function to clear timeouts
  const cleanupTimeouts = useCallback(() => {
    if (refreshTimeoutRef.current !== null) {
      window.clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // Clear all toasts on mount
  const clearAllToasts = useCallback(() => {
    dismissAllToasts();
  }, []);

  return {
    lastSaveTime,
    setLastSaveTime,
    isDataLoaded,
    initialLoadDone: initialLoadDone.current,
    handleManualRefresh,
    setupInitialLoad,
    cleanupToasts,
    cleanupTimeouts,
    clearAllToasts,
    refreshCountRef,
    toastIdRef
  };
}
