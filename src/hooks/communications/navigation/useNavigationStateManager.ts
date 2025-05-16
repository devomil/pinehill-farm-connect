
import { useCallback } from "react";
import { useNavigationState } from "./useNavigationState";
import { usePendingNavigation } from "./usePendingNavigation";

/**
 * Manages the navigation state references for the tab system
 * This is a composition hook that combines the state and pending navigation hooks
 */
export function useNavigationStateManager() {
  const { 
    navigationComplete, 
    navigationInProgress, 
    startNavigation, 
    completeNavigation 
  } = useNavigationState();
  
  const {
    pendingNavigation,
    setPendingNavigation,
    hasPendingNavigation
  } = usePendingNavigation();

  return {
    // Navigation state
    navigationComplete,
    navigationInProgress,
    pendingNavigation,
    // Navigation actions
    startNavigation,
    completeNavigation,
    setPendingNavigation,
    hasPendingNavigation
  };
}
