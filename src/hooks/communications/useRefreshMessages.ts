
import { useCallback } from 'react';
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
  const refreshDashboardData = dashboard?.refetchData;
  
  // Combined refresh function that ensures all message-related data is up-to-date
  const refresh = useCallback(async () => {
    console.log("useRefreshMessages: Refreshing all message data");
    
    try {
      // Create an array of promises to run in parallel, filtering out undefined functions
      const refreshPromises = [
        refreshMessages && refreshMessages(),
        refetchEmployees && refetchEmployees(),
        refreshDashboardData && refreshDashboardData()
      ].filter(Boolean); // Filter out undefined values
      
      // If there are no valid refresh functions, show a warning
      if (refreshPromises.length === 0) {
        console.warn("No refresh functions available");
        return false;
      }
      
      // Run all refresh operations in parallel
      await Promise.all(refreshPromises);
      
      console.log("useRefreshMessages: Successfully refreshed all message data");
      return true;
    } catch (error) {
      console.error("useRefreshMessages: Error refreshing message data", error);
      toast.error("Failed to refresh message data");
      return false;
    }
  }, [refreshMessages, refetchEmployees, refreshDashboardData]);
  
  return refresh;
}

// Export a consolidated file for message refresh management hooks
export * from './useMessageRefreshManager';
