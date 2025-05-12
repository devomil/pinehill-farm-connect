
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

  const refreshMessages = useCallback(() => {
    const now = Date.now();
    
    // Prevent multiple refreshes within a short time period, but make exception for admin users
    const isAdmin = currentUser?.role === 'admin';
    const minRefreshInterval = isAdmin ? 1500 : 3000; // 1.5s for admins, 3s for others
    
    if (refreshInProgress.current || (!isAdmin && now - lastRefreshTime.current < minRefreshInterval)) {
      console.log("Communications refresh skipped - too soon or already in progress");
      return Promise.resolve();
    }
    
    console.log("Manually refreshing communications data");
    refreshInProgress.current = true;
    lastRefreshTime.current = now;
    
    return refetch().finally(() => {
      setTimeout(() => {
        refreshInProgress.current = false;
      }, isAdmin ? 500 : 1000); // Shorter cooldown for admins
    });
  }, [refetch, currentUser]);

  return {
    refreshMessages,
    lastRefreshTime,
    refreshInProgress
  };
}
