
import { useCallback, useRef } from 'react';
import { useCommunications } from '@/hooks/useCommunications';
import { useEmployeeDirectory } from '@/hooks/useEmployeeDirectory';
import { useDashboardData } from '@/hooks/useDashboardData';
import { toast } from 'sonner';

/**
 * Custom hook that provides a centralized way to refresh message-related data
 * across different components without duplicating code or logic.
 */
export function useRefreshMessages() {
  // Access the individual refresh functions from various hooks
  // Using optional chaining to prevent errors if hooks return undefined
  const communications = useCommunications();
  const refreshMessages = communications?.refreshMessages;
  
  const employeeDirectory = useEmployeeDirectory();
  const refetchEmployees = employeeDirectory?.refetch;
  
  const dashboard = useDashboardData();
  const handleRefreshData = dashboard?.handleRefreshData; // Using handleRefreshData instead of refreshDashboardData
  
  // Track last refresh time to prevent excessive refreshes
  const lastRefreshTimestamp = useRef<number>(Date.now());
  const isRefreshing = useRef<boolean>(false);
  const lastEmployeeRefresh = useRef<number>(Date.now());
  const EMPLOYEE_REFRESH_THRESHOLD = 60000; // Only refresh employee data every 60 seconds
  
  // Combined refresh function that ensures all message-related data is up-to-date
  const refresh = useCallback(async () => {
    console.log("useRefreshMessages: Checking refresh threshold");
    
    // Implement throttling - prevent refreshes within 10 seconds of each other
    const now = Date.now();
    const refreshThreshold = 10000; // 10 seconds
    
    if (isRefreshing.current) {
      console.log("useRefreshMessages: Refresh already in progress, skipping");
      return false;
    }
    
    if (now - lastRefreshTimestamp.current < refreshThreshold) {
      console.log(`useRefreshMessages: Skipping refresh, last refresh was ${(now - lastRefreshTimestamp.current)/1000}s ago`);
      return false;
    }
    
    console.log("useRefreshMessages: Refreshing all message data");
    isRefreshing.current = true;
    lastRefreshTimestamp.current = now;
    
    try {
      // Always refresh messages
      const refreshPromises: Promise<any>[] = [];
      
      if (refreshMessages) {
        refreshPromises.push(refreshMessages());
      }
      
      // Only refresh employee directory occasionally to reduce frequency
      const shouldRefreshEmployees = now - lastEmployeeRefresh.current > EMPLOYEE_REFRESH_THRESHOLD;
      if (shouldRefreshEmployees && refetchEmployees) {
        console.log("Refreshing employee directory (infrequent update)");
        refreshPromises.push(refetchEmployees());
        lastEmployeeRefresh.current = now;
      } else {
        console.log("Skipping employee directory refresh - too frequent");
      }
      
      // Add dashboard refresh if available
      if (handleRefreshData) {
        refreshPromises.push(handleRefreshData());
      }
      
      // Filter out undefined values
      const validRefreshPromises = refreshPromises.filter(Boolean);
      
      // If there are no valid refresh functions, show a warning
      if (validRefreshPromises.length === 0) {
        console.warn("No refresh functions available");
        return false;
      }
      
      // Run all refresh operations in parallel
      await Promise.all(validRefreshPromises);
      
      console.log("useRefreshMessages: Successfully refreshed all message data");
      return true;
    } catch (error) {
      console.error("useRefreshMessages: Error refreshing message data", error);
      toast.error("Failed to refresh message data");
      return false;
    } finally {
      // Only reset refreshing flag after a short delay to prevent rapid consecutive refreshes
      setTimeout(() => {
        isRefreshing.current = false;
      }, 5000); // 5 second cooldown period
    }
  }, [refreshMessages, refetchEmployees, handleRefreshData]); // Updated dependency array
  
  return refresh;
}

// Export a consolidated file for message refresh management hooks
export * from './useMessageRefreshManager';
