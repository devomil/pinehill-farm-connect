
import { useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QueryObserverResult } from "@tanstack/react-query";

/**
 * Hook for refreshing messages data
 * @returns A function to refresh messages
 */
export function useRefreshMessages() {
  const queryClient = useQueryClient();
  const lastRefreshTime = useRef<number>(Date.now());
  const refreshInProgress = useRef<boolean>(false);
  
  const refreshMessages = useCallback(() => {
    // Skip if already refreshing or too soon after previous refresh
    if (refreshInProgress.current) {
      console.log("Skipping refetch - already in progress");
      return Promise.resolve();
    }
    
    const now = Date.now();
    if (now - lastRefreshTime.current < 1000) {
      console.log("Skipping refetch - too soon");
      return Promise.resolve();
    }
    
    console.log("Refreshing messages data");
    refreshInProgress.current = true;
    lastRefreshTime.current = now;
    
    return queryClient.invalidateQueries({ queryKey: ["communications"] })
      .finally(() => {
        setTimeout(() => {
          refreshInProgress.current = false;
        }, 500);
      });
  }, [queryClient]);
  
  return refreshMessages;
}

/**
 * Enhanced hook for managing message refresh with user context
 * @param currentUser The current user
 * @param refetch The refetch function from useQuery
 * @returns Object with refresh function and state refs
 */
export function useMessageRefreshManager(currentUser: any, refetch: () => Promise<any>) {
  const lastRefreshTime = useRef<number>(Date.now());
  const refreshInProgress = useRef<boolean>(false);
  
  const refreshMessages = useCallback(() => {
    // Skip if already refreshing or too soon after previous refresh
    if (refreshInProgress.current) {
      console.log("Refresh already in progress");
      return Promise.resolve();
    }
    
    const now = Date.now();
    if (now - lastRefreshTime.current < 1000) {
      console.log("Skipping refetch - too soon");
      return Promise.resolve();
    }
    
    console.log("Refreshing messages data");
    refreshInProgress.current = true;
    lastRefreshTime.current = now;
    
    return refetch().finally(() => {
      setTimeout(() => {
        refreshInProgress.current = false;
      }, 500);
    });
  }, [refetch]);
  
  return { refreshMessages, lastRefreshTime, refreshInProgress };
}
