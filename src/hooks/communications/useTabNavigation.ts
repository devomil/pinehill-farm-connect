
import { useCallback } from "react";
import { useNavigationStateManager } from "./navigation/useNavigationStateManager";
import { useTabRefresh } from "./useTabRefresh";
import { createDebugContext } from "@/utils/debugUtils";
import { createDebouncedFunction } from "./utils/navigationUtils";
import { UseTabNavigationProps, NavigationResult } from "./navigation/types";
import { useProcessPendingNavigation } from "./navigation/useProcessPendingNavigation";
import { useNavigationChange } from "./navigation/useNavigationChange";

/**
 * Hook to manage tab navigation with proper state management and debouncing
 */
export function useTabNavigation({
  activeTab,
  setActiveTab,
  location,
  navigationComplete,
  refreshMessages,
  isRefreshing,
  lastRefreshTime
}: UseTabNavigationProps): NavigationResult {
  const debug = createDebugContext('TabNavigation');
  
  // Use navigation state manager for maintaining state refs
  const {
    navigationInProgress,
    pendingNavigation,
    startNavigation,
    completeNavigation,
    setPendingNavigation,
    hasPendingNavigation
  } = useNavigationStateManager();
  
  // Tab refresh utilities
  const { performRefresh } = useTabRefresh({
    refreshMessages,
    completeNavigation,
    isRefreshing,
    lastRefreshTime
  });

  // Setup handler for pending navigation processing
  const processNavigationHandler = useCallback(
    (tab: string) => {
      // We need this intermediate function that takes the tab as a parameter
      // This is needed for the useProcessPendingNavigation hook
      debug.info(`Base navigation handler called for: ${tab}`);
    },
    [debug]
  );

  // Get the pending navigation processor
  const { processPendingNavigation } = useProcessPendingNavigation({
    pendingNavigation,
    setPendingNavigation,
    hasPendingNavigation,
    handleTabChange: processNavigationHandler
  });

  // Get the navigation change handler
  const { handleTabChange: baseHandleTabChange, loopDetected } = useNavigationChange({
    activeTab,
    setActiveTab,
    location,
    navigationComplete,
    startNavigation,
    completeNavigation,
    setPendingNavigation,
    navigationInProgress,
    performRefresh,
    processPendingNavigation
  });

  // Create our own simple debounce function
  const debouncedTabChange = useCallback(
    (value: string) => createDebouncedFunction(baseHandleTabChange, 300)(value),
    [baseHandleTabChange]
  );

  return { 
    handleTabChange: debouncedTabChange,
    navigationInProgress,
    loopDetected: { current: loopDetected }
  };
}
