
import { useCallback, useRef } from "react";
import { User } from "@/types";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";

type RefetchFunction = (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, Error>>;

/**
 * Optimized refresh manager with improved debounce and throttling
 */
export function useMessageRefreshManager(
  currentUser: User | null,
  refetch: RefetchFunction
) {
  const lastRefreshTime = useRef<number>(Date.now());
  const refreshInProgress = useRef<boolean>(false);
  const refreshDebounceTimer = useRef<number | null>(null);
  const refreshCount = useRef<number>(0);
  const MAX_REFRESHES_PER_SESSION = 100; // Limit total refreshes per session

  const refreshMessages = useCallback(() => {
    // Guard against too many refreshes
    if (refreshCount.current > MAX_REFRESHES_PER_SESSION) {
      console.warn("Maximum refresh count reached for this session");
      return Promise.resolve();
    }
    
    const now = Date.now();
    
    // Clear any existing debounce timer
    if (refreshDebounceTimer.current !== null) {
      clearTimeout(refreshDebounceTimer.current);
      refreshDebounceTimer.current = null;
    }
    
    // Much longer refresh intervals to reduce database load
    const isAdmin = currentUser?.role === 'admin';
    const minRefreshInterval = isAdmin ? 30000 : 60000; // 30s for admins, 60s for others - greatly increased
    
    if (refreshInProgress.current) {
      console.log("Communications refresh skipped - already in progress");
      return Promise.resolve();
    }
    
    if (now - lastRefreshTime.current < minRefreshInterval) {
      console.log("Debouncing communications refresh - too soon, waiting:", 
        Math.round((minRefreshInterval - (now - lastRefreshTime.current)) / 1000), "seconds");
      
      // Set up a debounced refresh with even longer delay
      return new Promise<void>((resolve) => {
        refreshDebounceTimer.current = window.setTimeout(() => {
          console.log("Executing debounced communications refresh");
          refreshInProgress.current = true;
          lastRefreshTime.current = Date.now();
          refreshCount.current++;
          
          refetch({ stale: false })
            .then(() => resolve())
            .finally(() => {
              setTimeout(() => {
                refreshInProgress.current = false;
              }, 2000);
            });
        }, minRefreshInterval - (now - lastRefreshTime.current)) as unknown as number;
      });
    }
    
    // Regular refresh flow with longer cooldown
    console.log("Manually refreshing communications data");
    refreshInProgress.current = true;
    lastRefreshTime.current = now;
    refreshCount.current++;
    
    return refetch({ stale: false }).finally(() => {
      // Much longer cooldown to prevent immediate subsequent refreshes
      setTimeout(() => {
        refreshInProgress.current = false;
      }, isAdmin ? 5000 : 10000); // 5-10s cooldown periods
    });
  }, [refetch, currentUser, MAX_REFRESHES_PER_SESSION]);

  // Clean up function with improved timeout clearing
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
    refreshCount,
    cleanup
  };
}
