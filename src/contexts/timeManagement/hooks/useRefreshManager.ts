
import { useCallback, useRef, useState } from "react";
import { shouldAllowRefresh } from "../utils";

/**
 * Hook that manages refresh operations with throttling and status tracking
 */
export const useRefreshManager = () => {
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const refreshInProgress = useRef<boolean>(false);
  
  // Check if a refresh should be allowed
  const canRefresh = useCallback(() => {
    return shouldAllowRefresh(refreshInProgress.current, lastRefreshTime);
  }, [lastRefreshTime]);
  
  // Start refresh operation
  const startRefresh = useCallback(() => {
    refreshInProgress.current = true;
    setLastRefreshTime(Date.now());
    
    // Reset the refresh lock after a timeout
    setTimeout(() => {
      refreshInProgress.current = false;
    }, 5000);
    
    return true;
  }, []);
  
  return {
    canRefresh,
    startRefresh,
    refreshInProgress,
    lastRefreshTime
  };
};
