
import { useCallback, useRef } from 'react';
import { useCommunications } from '@/hooks/useCommunications';
import { useEmployeeDirectory } from '@/hooks/useEmployeeDirectory';
import { useDashboardData } from '@/hooks/useDashboardData';
import { toast } from 'sonner';

/**
 * Type guard to safely check if a value is Promise-like
 */
function isPromise<T = any>(val: unknown): val is Promise<T> {
  return Boolean(val) && typeof val === 'object' && val !== null && 'then' in val && typeof (val as any).then === 'function';
}

/**
 * Optimized refresh hook with aggressive throttling to prevent performance issues
 */
export function useRefreshMessages() {
  const communications = useCommunications();
  const refreshMessages = communications?.refreshMessages;
  
  const employeeDirectory = useEmployeeDirectory();
  const refetchEmployees = employeeDirectory?.refetch;
  
  const dashboard = useDashboardData();
  const handleRefreshData = dashboard?.handleRefreshData;
  
  // Much more aggressive throttling
  const lastRefreshTimestamp = useRef<number>(0);
  const isRefreshing = useRef<boolean>(false);
  const lastEmployeeRefresh = useRef<number>(0);
  const REFRESH_THRESHOLD = 30000; // Increased to 30 seconds
  const EMPLOYEE_REFRESH_THRESHOLD = 300000; // Increased to 5 minutes
  const refreshCount = useRef<number>(0);
  const MAX_REFRESHES_PER_HOUR = 10; // Limit refreshes per hour
  
  // Combined refresh function with heavy throttling
  const refresh = useCallback(async () => {
    const now = Date.now();
    
    // Check if we're refreshing too frequently
    if (isRefreshing.current) {
      console.log("useRefreshMessages: Refresh already in progress, skipping");
      return false;
    }
    
    // Aggressive throttling
    if (now - lastRefreshTimestamp.current < REFRESH_THRESHOLD) {
      console.log(`useRefreshMessages: Skipping refresh, last refresh was ${(now - lastRefreshTimestamp.current)/1000}s ago (minimum ${REFRESH_THRESHOLD/1000}s)`);
      return false;
    }
    
    // Check hourly limit
    const oneHourAgo = now - 3600000;
    if (refreshCount.current >= MAX_REFRESHES_PER_HOUR) {
      // Reset counter if an hour has passed
      if (lastRefreshTimestamp.current < oneHourAgo) {
        refreshCount.current = 0;
      } else {
        console.log("useRefreshMessages: Hourly refresh limit reached");
        toast.warning("Refresh limit reached", {
          description: "Too many refreshes in the last hour. Please wait.",
          duration: 5000
        });
        return false;
      }
    }
    
    console.log("useRefreshMessages: Starting optimized refresh");
    isRefreshing.current = true;
    lastRefreshTimestamp.current = now;
    refreshCount.current++;
    
    try {
      const refreshPromises: Promise<any>[] = [];
      
      // Always refresh messages but with timeout
      if (refreshMessages) {
        try {
          const result = refreshMessages();
          if (isPromise(result)) {
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Refresh timeout')), 10000)
            );
            refreshPromises.push(Promise.race([result, timeoutPromise]));
          }
        } catch (e) {
          console.error("Error calling refreshMessages:", e);
        }
      }
      
      // Only refresh employees very occasionally
      const shouldRefreshEmployees = now - lastEmployeeRefresh.current > EMPLOYEE_REFRESH_THRESHOLD;
      if (shouldRefreshEmployees && refetchEmployees) {
        console.log("Refreshing employee directory (infrequent update)");
        refreshPromises.push(refetchEmployees());
        lastEmployeeRefresh.current = now;
      }
      
      // Skip dashboard refresh to reduce load
      // Only refresh dashboard if absolutely necessary
      const shouldRefreshDashboard = refreshPromises.length === 0 && handleRefreshData;
      if (shouldRefreshDashboard) {
        try {
          const result = handleRefreshData();
          if (isPromise(result)) {
            refreshPromises.push(result);
          }
        } catch (e) {
          console.error("Error calling handleRefreshData:", e);
        }
      }
      
      // Run refresh operations with timeout
      if (refreshPromises.length > 0) {
        await Promise.allSettled(refreshPromises);
      }
      
      console.log("useRefreshMessages: Refresh completed successfully");
      return true;
    } catch (error) {
      console.error("useRefreshMessages: Error during refresh", error);
      return false;
    } finally {
      // Add delay before allowing next refresh
      setTimeout(() => {
        isRefreshing.current = false;
      }, 5000);
    }
  }, [refreshMessages, refetchEmployees, handleRefreshData]);
  
  return {
    refresh,
    isRefreshing: isRefreshing.current,
    lastRefreshTime: lastRefreshTimestamp.current,
    canRefresh: !isRefreshing.current && 
                (Date.now() - lastRefreshTimestamp.current >= REFRESH_THRESHOLD) &&
                refreshCount.current < MAX_REFRESHES_PER_HOUR
  };
}
