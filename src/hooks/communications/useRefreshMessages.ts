
import { useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useRefreshMessages() {
  const queryClient = useQueryClient();
  const lastRefreshTime = useRef<number>(Date.now());
  const refreshInProgress = useRef<boolean>(false);
  
  const refreshMessages = useCallback(() => {
    if (refreshInProgress.current) {
      console.log("Skipping refetch - already in progress");
      return Promise.resolve();
    }
    
    if (Date.now() - lastRefreshTime.current < 1000) {
      console.log("Skipping refetch - too soon or already in progress");
      return Promise.resolve();
    }
    
    console.log("Refreshing messages data");
    refreshInProgress.current = true;
    lastRefreshTime.current = Date.now();
    
    return queryClient.invalidateQueries({ queryKey: ["communications"] })
      .finally(() => {
        setTimeout(() => {
          refreshInProgress.current = false;
        }, 500);
      });
  }, [queryClient]);
  
  return refreshMessages;
}

export function useMessageRefreshManager(currentUser: any, refetch: () => Promise<any>) {
  const lastRefreshTime = useRef<number>(Date.now());
  const refreshInProgress = useRef<boolean>(false);
  
  const refreshMessages = useCallback(() => {
    if (refreshInProgress.current) {
      console.log("Refresh already in progress");
      return Promise.resolve();
    }
    
    if (Date.now() - lastRefreshTime.current < 1000) {
      console.log("Skipping refetch - too soon");
      return Promise.resolve();
    }
    
    console.log("Refreshing messages data");
    refreshInProgress.current = true;
    lastRefreshTime.current = Date.now();
    
    return refetch().finally(() => {
      setTimeout(() => {
        refreshInProgress.current = false;
      }, 500);
    });
  }, [refetch]);
  
  return { refreshMessages, lastRefreshTime, refreshInProgress };
}
