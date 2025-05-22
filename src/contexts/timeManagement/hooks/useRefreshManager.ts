
import { useState, useCallback } from 'react';

export function useRefreshManager() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  const canRefresh = useCallback(() => {
    const now = Date.now();
    const MIN_REFRESH_INTERVAL = 10000; // 10 seconds minimum between refreshes
    
    if (isRefreshing) {
      console.log('Already refreshing, please wait');
      return false;
    }
    
    if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
      console.log(`Too soon for another refresh (${Math.round((now - lastRefreshTime) / 1000)}s < ${MIN_REFRESH_INTERVAL / 1000}s)`);
      return false;
    }
    
    return true;
  }, [isRefreshing, lastRefreshTime]);

  const startRefresh = useCallback(() => {
    setIsRefreshing(true);
    setLastRefreshTime(Date.now());
    
    // Automatically reset refreshing state after timeout
    setTimeout(() => {
      setIsRefreshing(false);
    }, 5000);
  }, []);

  return {
    isRefreshing,
    canRefresh,
    startRefresh,
    lastRefreshTime
  };
}
