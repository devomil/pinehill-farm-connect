
import { useCallback } from 'react';
import { toast } from "sonner";

/**
 * Custom hook to manage refetching dashboard data
 */
export function useDashboardRefetch(
  refetchFunctions: {
    refetchPendingTimeOff: () => void;
    refetchUserTimeOff: () => void;
    refetchShiftCoverage: () => void;
    refetchAnnouncements: () => void;
    refetchTrainings: () => void;
  },
  currentUserId?: string
) {
  // Refetch data with improved logging
  const refetchData = useCallback(() => {
    console.log("Manually refreshing dashboard data");
    
    // Force refetches for improved reliability
    if (currentUserId) {
      setTimeout(() => {
        refetchFunctions.refetchPendingTimeOff();
        refetchFunctions.refetchUserTimeOff();
        refetchFunctions.refetchShiftCoverage();
        refetchFunctions.refetchAnnouncements();
        refetchFunctions.refetchTrainings();
      }, 100);
    }
  }, [
    currentUserId,
    refetchFunctions
  ]);

  const handleRefreshData = useCallback(() => {
    toast.info("Refreshing dashboard data...");
    console.log("Manual dashboard refresh triggered");
    refetchData();
  }, [refetchData]);

  return {
    refetchData,
    handleRefreshData
  };
}
