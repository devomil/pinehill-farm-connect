
import { useCallback, useRef } from "react";
import { User } from "@/types";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";

type RefetchFunction = (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, Error>>;

export function useMessageRefreshManager(
  currentUser: User | null,
  refetch: RefetchFunction
) {
  const lastRefreshTime = useRef<number>(Date.now());
  const refreshInProgress = useRef<boolean>(false);
  const refreshDebounceTimer = useRef<number | null>(null);

  const refreshMessages = useCallback(() => {
    const now = Date.now();
    
    // Clear any existing debounce timer
    if (refreshDebounceTimer.current !== null) {
      clearTimeout(refreshDebounceTimer.current);
      refreshDebounceTimer.current = null;
    }
    
    // Prevent multiple refreshes within a short time period - INCREASED intervals
    const isAdmin = currentUser?.role === 'admin';
    const minRefreshInterval = isAdmin ? 10000 : 15000; // 10s for admins, 15s for others - increased
    
    if (refreshInProgress.current) {
      console.log("Communications refresh skipped - already in progress");
      return Promise.resolve();
    }
    
    if (now - lastRefreshTime.current < minRefreshInterval) {
      console.log("Debouncing communications refresh - too soon");
      
      // Set up a debounced refresh
      return new Promise<void>((resolve) => {
        refreshDebounceTimer.current = window.setTimeout(() => {
          console.log("Executing debounced communications refresh");
          refreshInProgress.current = true;
          lastRefreshTime.current = Date.now();
          
          refetch()
            .then(() => resolve())
            .finally(() => {
              setTimeout(() => {
                refreshInProgress.current = false;
              }, 1000);
            });
        }, minRefreshInterval - (now - lastRefreshTime.current)) as unknown as number;
      });
    }
    
    // Regular refresh flow
    console.log("Manually refreshing communications data");
    refreshInProgress.current = true;
    lastRefreshTime.current = now;
    
    return refetch().finally(() => {
      // Longer cooldown to prevent immediate subsequent refreshes
      setTimeout(() => {
        refreshInProgress.current = false;
      }, isAdmin ? 2000 : 3000); // Longer cooldown periods
    });
  }, [refetch, currentUser]);

  // Clean up function
  const cleanup = useCallback(() => {
    if (refreshDebounceTimer.current !== null) {
      clearTimeout(refreshDebounceTimer.current);
      refreshDebounceTimer.current = null;
    }
  }, []);

  return {
    refreshMessages,
    lastRefreshTime,
    refreshInProgress,
    cleanup
  };
}
