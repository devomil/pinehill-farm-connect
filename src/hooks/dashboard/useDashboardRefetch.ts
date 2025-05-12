
import { useCallback, useRef } from 'react';
import { toast } from "sonner";

/**
 * Custom hook to manage refetching dashboard data with throttling
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
  const isRefetching = useRef(false);
  const lastRefetchTime = useRef(0);

  // Refetch data with improved logging and throttling
  const refetchData = useCallback(() => {
    const now = Date.now();
    
    // Don't allow refetches more frequently than every 3 seconds
    if (isRefetching.current || (now - lastRefetchTime.current < 3000)) {
      console.log("Skipping refetch - too soon or already in progress");
      return;
    }
    
    console.log("Refetching dashboard data");
    
    // Set refetching flag and update timestamp
    isRefetching.current = true;
    lastRefetchTime.current = now;
    
    // Force refetches for improved reliability
    if (currentUserId) {
      setTimeout(() => {
        try {
          refetchFunctions.refetchPendingTimeOff();
          refetchFunctions.refetchUserTimeOff();
          refetchFunctions.refetchShiftCoverage();
          refetchFunctions.refetchAnnouncements();
          refetchFunctions.refetchTrainings();
        } catch (err) {
          console.error("Error during refetch:", err);
        } finally {
          // Reset refetching flag after a short delay
          setTimeout(() => {
            isRefetching.current = false;
          }, 3000);
        }
      }, 100);
    } else {
      isRefetching.current = false;
    }
  }, [
    currentUserId,
    refetchFunctions
  ]);

  return {
    refetchData
  };
}
