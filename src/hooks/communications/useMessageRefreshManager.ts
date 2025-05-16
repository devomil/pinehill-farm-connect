
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
  const MAX_REFRESHES_PER_SESSION = 40; // Reduced from 100 to 40
  const FORCED_COOLDOWN_TIME = 60000; // 1 minute forced cooldown after MAX_REFRESHES reached

  // Track when we hit refresh limit
  const refreshLimitHitTime = useRef<number | null>(null);

  const refreshMessages = useCallback(() => {
    const now = Date.now();
    
    // If we've hit refresh limit, enforce a long cooldown period
    if (refreshLimitHitTime.current !== null) {
      const timeSinceLimitHit = now - refreshLimitHitTime.current;
      if (timeSinceLimitHit < FORCED_COOLDOWN_TIME) {
        console.log(`Refresh limit reached. Enforcing cooldown: ${Math.round((FORCED_COOLDOWN_TIME - timeSinceLimitHit)/1000)}s remaining`);
        return Promise.resolve();
      } else {
        // Reset after cooldown period
        console.log("Refresh cooldown period complete, resetting counter");
        refreshCount.current = 0;
        refreshLimitHitTime.current = null;
      }
    }
    
    // Check refresh count
    if (refreshCount.current >= MAX_REFRESHES_PER_SESSION) {
      if (refreshLimitHitTime.current === null) {
        console.warn(`Maximum refresh count (${MAX_REFRESHES_PER_SESSION}) reached for this session. Enforcing cooldown.`);
        refreshLimitHitTime.current = now;
      }
      return Promise.resolve();
    }
    
    // Clear any existing debounce timer
    if (refreshDebounceTimer.current !== null) {
      clearTimeout(refreshDebounceTimer.current);
      refreshDebounceTimer.current = null;
    }
    
    // Much longer refresh intervals to reduce database load
    const isAdmin = currentUser?.role === 'admin';
    const minRefreshInterval = isAdmin ? 90000 : 120000; // 1.5min for admins, 2min for others - greatly increased
    
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
          
          refetch()
            .then(() => resolve())
            .finally(() => {
              setTimeout(() => {
                refreshInProgress.current = false;
              }, 5000); // 5 second cooldown
            });
        }, minRefreshInterval - (now - lastRefreshTime.current)) as unknown as number;
      });
    }
    
    // Regular refresh flow with longer cooldown
    console.log("Manually refreshing communications data");
    refreshInProgress.current = true;
    lastRefreshTime.current = now;
    refreshCount.current++;
    
    return refetch().finally(() => {
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
