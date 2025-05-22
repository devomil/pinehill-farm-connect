
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

  const performRefresh = useCallback(async () => {
    debug.info("Refreshing messages tab data");
    isRefreshing.current = true;
    
    // Skip showing loading toast if we've shown one recently
    const now = Date.now();
    const shouldShowLoadingToast = !loadingToastShown.current && (now - lastToastTime.current > 30000);
    
    // Only show loading toast if needed
    let loadingToast: string | undefined;
    if (shouldShowLoadingToast) {
      loadingToast = toast.loading("Loading messages...");
      loadingToastShown.current = true;
      lastToastTime.current = now;
    }
    
    try {
      await refreshMessages();
      
      // Only show success toast if we showed a loading toast
      if (loadingToast) {
        toast.success("Messages loaded successfully", {
          id: loadingToast,
          duration: 2000
        });
      }
    } catch (err) {
      console.error("Error refreshing messages:", err);
      
      // Always show error toast
      if (loadingToast) {
        toast.error("Failed to load messages. Please try again.", {
          id: loadingToast
        });
      } else {
        toast.error("Failed to load messages. Please try again.");
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
