
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTimeOffDashboard } from "./dashboard/useTimeOffDashboard";
import { useShiftCoverageDashboard } from "./dashboard/useShiftCoverageDashboard";
import { useAnnouncementsDashboard } from "./dashboard/useAnnouncementsDashboard";
import { useTrainingsDashboard } from "./dashboard/useTrainingsDashboard";
import { useDashboardRefetch } from "./dashboard/useDashboardRefetch";

/**
 * Main hook for fetching all dashboard data
 */
export function useDashboardData() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  const [retryCount, setRetryCount] = useState(0);
  
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
  const { refetchData, handleRefreshData } = useDashboardRefetch(
    refetchFunctions,
    currentUser?.id
  );

  // Add effect to retry fetching if there was an error
  useEffect(() => {
    const errors = [
      timeOff.error, 
      shiftCoverage.shiftCoverageError, 
      announcements.announcementsError, 
      trainings.assignedTrainingsError
    ].filter(Boolean);
    
    if (errors.length > 0 && currentUser && retryCount < 3) {
      console.log("Detected error in dashboard data, will retry in 3 seconds", errors[0]);
      const timer = setTimeout(() => {
        console.log("Retrying dashboard data fetch after error");
        setRetryCount(prev => prev + 1);
        refetchData();
      }, 3000);
      
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

  // Add auto-refresh logic for dashboard data
  useEffect(() => {
    console.log("Setting up dashboard auto-refresh");
    
    // Initial fetch with slight delay to let the page render first
    const initialFetchTimer = setTimeout(() => {
      console.log("Initial dashboard data fetch");
      refetchData();
    }, 500);
    
    // Auto refresh every 30 seconds
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing dashboard data");
      refetchData();
    }, 30000);
    
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
    setRetryCount
  };
}
