
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
 * Manages refreshing data when a tab is selected
 */
export function useTabRefresh({
  refreshMessages,
  completeNavigation,
  isRefreshing,
  lastRefreshTime
}: TabRefreshProps) {
  const debug = createDebugContext('TabRefresh');
  const processingPendingNavigation = useRef<boolean>(false);

  const performRefresh = useCallback(async () => {
    debug.info("Refreshing messages tab data");
    isRefreshing.current = true;
    
    // Show a loading toast
    const loadingToast = toast.loading("Loading messages...");
    
    try {
      await refreshMessages();
      // Update the loading toast to success
      toast.success("Messages loaded successfully", {
        id: loadingToast
      });
    } catch (err) {
      console.error("Error refreshing messages:", err);
      toast.error("Failed to load messages. Please try again.", {
        id: loadingToast
      });
    } finally {
      isRefreshing.current = false;
      lastRefreshTime.current = Date.now();
      
      // Mark navigation as complete after a short delay
      setTimeout(() => {
        completeNavigation();
        debug.info("Navigation complete set to true after refresh");
      }, 300); // Increased delay to ensure everything is ready
    }
  }, [refreshMessages, isRefreshing, lastRefreshTime, completeNavigation, debug]);

  return {
    performRefresh,
    processingPendingNavigation
  };
}
