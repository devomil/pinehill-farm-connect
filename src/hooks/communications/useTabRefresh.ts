
import { useRef, useCallback } from "react";
import { createDebugContext } from "@/utils/debugUtils";
import { QueryObserverResult } from "@tanstack/react-query";
import { toast } from "sonner";

interface TabRefreshProps {
  refreshMessages: () => Promise<void | QueryObserverResult<any, Error>>;
  completeNavigation: () => void;
  isRefreshing: React.MutableRefObject<boolean>;
  lastRefreshTime: React.MutableRefObject<number>;
}

/**
 * Manages refreshing data when a tab is selected with optimized toast handling
 */
export function useTabRefresh({
  refreshMessages,
  completeNavigation,
  isRefreshing,
  lastRefreshTime
}: TabRefreshProps) {
  const debug = createDebugContext('TabRefresh');
  const processingPendingNavigation = useRef<boolean>(false);
  const loadingToastShown = useRef<boolean>(false);
  const lastToastTime = useRef<number>(0);
  const toastIdRef = useRef<string | null>(null);

  const performRefresh = useCallback(async () => {
    debug.info("Refreshing messages tab data");
    isRefreshing.current = true;
    
    // Skip showing loading toast if we've shown one recently
    const now = Date.now();
    const shouldShowLoadingToast = !loadingToastShown.current && (now - lastToastTime.current > 30000);
    
    // Clear any existing toast to prevent duplicates
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
    
    // Only show loading toast if needed
    if (shouldShowLoadingToast && window.location.pathname.includes('/time')) {
      // Only show on time management page
      const loadingToastId = toast.loading("Loading messages...").toString();
      toastIdRef.current = loadingToastId;
      loadingToastShown.current = true;
      lastToastTime.current = now;
      
      // Auto-dismiss the toast after 5 seconds even if the operation isn't complete
      setTimeout(() => {
        if (toastIdRef.current === loadingToastId) {
          toast.dismiss(loadingToastId);
          toastIdRef.current = null;
          loadingToastShown.current = false;
        }
      }, 5000);
    }
    
    try {
      await refreshMessages();
      
      // Only show success toast if we showed a loading toast and we're still on the page
      if (toastIdRef.current && window.location.pathname.includes('/time')) {
        toast.success("Messages loaded successfully", {
          id: toastIdRef.current,
          duration: 2000
        });
        toastIdRef.current = null;
      } else if (toastIdRef.current) {
        // Just dismiss the toast if we're not on the page anymore
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    } catch (err) {
      console.error("Error refreshing messages:", err);
      
      // Show error toast only if we're still on the page
      if (toastIdRef.current && window.location.pathname.includes('/time')) {
        toast.error("Failed to load messages. Please try again.", {
          id: toastIdRef.current
        });
        toastIdRef.current = null;
      } else if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    } finally {
      isRefreshing.current = false;
      lastRefreshTime.current = Date.now();
      loadingToastShown.current = false;
      
      // Mark navigation as complete after a short delay
      setTimeout(() => {
        completeNavigation();
        debug.info("Navigation complete set to true after refresh");
      }, 500); // Better delay to ensure everything is ready
    }
  }, [refreshMessages, isRefreshing, lastRefreshTime, completeNavigation, debug]);

  return {
    performRefresh,
    processingPendingNavigation
  };
}
