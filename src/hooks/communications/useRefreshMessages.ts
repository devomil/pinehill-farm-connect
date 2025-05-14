
import { useCallback } from 'react';
import { useCommunications } from '@/hooks/useCommunications';
import { useEmployeeDirectory } from '@/hooks/useEmployeeDirectory';
import { useDashboardData } from '@/hooks/useDashboardData';

/**
 * Custom hook that provides a centralized way to refresh message-related data
 * across different components without duplicating code or logic.
 */
export function useRefreshMessages() {
  const { refreshMessages } = useCommunications();
  const { refetch: refetchEmployees } = useEmployeeDirectory();
  const { refetchData: refreshDashboardData } = useDashboardData();
  
  // Combined refresh function that ensures all message-related data is up-to-date
  const refresh = useCallback(async () => {
    console.log("useRefreshMessages: Refreshing all message data");
    
    try {
      // Refresh all data in parallel
      await Promise.all([
        refreshMessages(),
        refetchEmployees(),
        refreshDashboardData()
      ]);
      
      console.log("useRefreshMessages: Successfully refreshed all message data");
      return true;
    } catch (error) {
      console.error("useRefreshMessages: Error refreshing message data", error);
      return false;
    }
  }, [refreshMessages, refetchEmployees, refreshDashboardData]);
  
  return refresh;
}

// Export a consolidated file for message refresh management hooks
export * from './useMessageRefreshManager';
