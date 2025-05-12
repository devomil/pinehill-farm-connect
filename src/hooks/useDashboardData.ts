
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTimeOffDashboard } from "./dashboard/useTimeOffDashboard";
import { useShiftCoverageDashboard } from "./dashboard/useShiftCoverageDashboard";
import { useAnnouncementsDashboard } from "./dashboard/useAnnouncementsDashboard";
import { useTrainingsDashboard } from "./dashboard/useTrainingsDashboard";
import { useDashboardRefetch } from "./dashboard/useDashboardRefetch";
import { toast } from "sonner";

/**
 * Main hook for fetching all dashboard data
 */
export function useDashboardData() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  const [retryCount, setRetryCount] = useState(0);
  const refreshInProgress = useRef(false);
  const lastRefreshTime = useRef(0);
  
  // Log when the hook is initialized or retries
  useEffect(() => {
    console.log(`useDashboardData: Initialized with retryCount=${retryCount}, user=${currentUser?.id}, isAdmin=${isAdmin}`);
  }, [retryCount, currentUser, isAdmin]);

  // Use individual data hooks
  const timeOff = useTimeOffDashboard(currentUser, retryCount, isAdmin);
  const shiftCoverage = useShiftCoverageDashboard(currentUser, retryCount, isAdmin);
  const announcements = useAnnouncementsDashboard(currentUser, retryCount);
  const trainings = useTrainingsDashboard(currentUser, retryCount);

  // Create refetch functions object
  const refetchFunctions = {
    refetchPendingTimeOff: timeOff.refetchPendingTimeOff,
    refetchUserTimeOff: timeOff.refetchUserTimeOff,
    refetchShiftCoverage: shiftCoverage.refetchShiftCoverage,
    refetchAnnouncements: announcements.refetchAnnouncements,
    refetchTrainings: trainings.refetchTrainings
  };

  // Use the refetch hook
  const { refetchData } = useDashboardRefetch(
    refetchFunctions,
    currentUser?.id
  );

  // Add effect to retry fetching if there was an error, with a longer delay
  useEffect(() => {
    const errors = [
      timeOff.error, 
      shiftCoverage.shiftCoverageError, 
      announcements.announcementsError, 
      trainings.assignedTrainingsError
    ].filter(Boolean);
    
    if (errors.length > 0 && currentUser && retryCount < 3) {
      console.log("Detected error in dashboard data, will retry in 5 seconds", errors[0]);
      const timer = setTimeout(() => {
        console.log("Retrying dashboard data fetch after error");
        setRetryCount(prev => prev + 1);
        refetchData();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [
    timeOff.error, 
    shiftCoverage.shiftCoverageError,
    announcements.announcementsError, 
    trainings.assignedTrainingsError,
    currentUser, 
    refetchData, 
    retryCount
  ]);

  // Add auto-refresh logic for dashboard data with much less frequent updates
  useEffect(() => {
    console.log("Setting up dashboard auto-refresh");
    
    // Initial fetch with slight delay to let the page render first
    const initialFetchTimer = setTimeout(() => {
      console.log("Initial dashboard data fetch");
      refetchData();
    }, 1000);
    
    // Auto refresh every 2 minutes (drastically reduced from 30 seconds)
    const intervalId = setInterval(() => {
      // Skip if a refresh is already in progress
      if (refreshInProgress.current) {
        console.log("Skipping scheduled refresh - another refresh is in progress");
        return;
      }
      
      // Skip if less than 60 seconds since last refresh
      const now = Date.now();
      if (now - lastRefreshTime.current < 60000) {
        console.log("Skipping scheduled refresh - too soon since last refresh");
        return;
      }
      
      console.log("Auto-refreshing dashboard data");
      refreshInProgress.current = true;
      lastRefreshTime.current = now;
      
      refetchData();
      
      // Reset the refresh flag after a delay
      setTimeout(() => {
        refreshInProgress.current = false;
      }, 5000);
    }, 120000); // Changed from 30000 (30s) to 120000 (2min)
    
    return () => {
      clearTimeout(initialFetchTimer);
      clearInterval(intervalId);
    };
  }, [refetchData]);

  // Determine if any data is still loading
  const loading = timeOff.loading || 
                  shiftCoverage.loading || 
                  announcements.loading;
  
  // Consolidate errors
  const error = timeOff.error || 
                shiftCoverage.shiftCoverageError || 
                announcements.announcementsError || 
                trainings.assignedTrainingsError || 
                null;

  // Create a refresh handler that updates the retry count, with throttling
  const handleRefreshData = useCallback(() => {
    // Skip if a refresh is already in progress
    if (refreshInProgress.current) {
      console.log("Refresh already in progress, skipping");
      return;
    }
    
    // Skip if less than 3 seconds since last refresh
    const now = Date.now();
    if (now - lastRefreshTime.current < 3000) {
      console.log("Too soon since last refresh, skipping");
      return;
    }
    
    toast.info("Refreshing dashboard data...");
    console.log("Manual dashboard refresh triggered");
    
    refreshInProgress.current = true;
    lastRefreshTime.current = now;
    
    setRetryCount(prev => prev + 1);
    refetchData();
    
    // Reset the refresh flag after a delay
    setTimeout(() => {
      refreshInProgress.current = false;
    }, 5000);
  }, [refetchData]);
  
  return {
    pendingTimeOff: timeOff.pendingTimeOff,
    userTimeOff: timeOff.userTimeOff,
    shiftCoverageMessages: shiftCoverage.shiftCoverageMessages,
    announcements: announcements.announcements,
    assignedTrainings: trainings.assignedTrainings,
    isAdmin,
    refetchData,
    loading,
    error,
    handleRefreshData,
    setRetryCount
  };
}
