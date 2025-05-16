
import { useCallback } from "react";
import { NavigationThrottler } from "./NavigationThrottler";
import { createDebugContext } from "@/utils/debugUtils";
import { toast } from "sonner";
import { isInRecoveryMode, buildTabPath, buildRecoveryPath } from "../utils/navigationUtils";
import { useNavigate } from "react-router-dom";

interface UseNavigationChangeProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  location: { pathname: string; search: string };
  navigationComplete: React.MutableRefObject<boolean>;
  startNavigation: () => void;
  completeNavigation: () => void;
  setPendingNavigation: (tab: string | null) => void;
  navigationInProgress: React.MutableRefObject<boolean>;
  performRefresh: () => Promise<void>;
  processPendingNavigation: () => void;
}

/**
 * Hook to manage the tab change navigation logic
 */
export function useNavigationChange({
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
}: UseNavigationChangeProps) {
  const debug = createDebugContext('NavigationChange');
  const navigate = useNavigate();
  
  // Create throttler instance to prevent rapid navigation
  const throttler = new NavigationThrottler();

  // Handle the navigation to a specific tab
  const handleTabChange = useCallback((value: string) => {
    debug.info(`Tab changing from ${activeTab} to ${value}`);
    
    // Prevent duplicate navigation
    if (activeTab === value) {
      debug.info("Tab already active, skipping navigation");
      return;
    }
    
    // Check for a navigation loop by tracking rapid requests
    const loopDetected = throttler.trackNavigationAttempt();
    
    if (loopDetected) {
      toast.error("Navigation loop detected", {
        description: "Use the debug panel to fix this issue",
        id: 'navigation-loop'
      });
    }
    
    // If navigation is already in progress, store this as the pending navigation
    if (navigationInProgress.current) {
      debug.info("Navigation already in progress, marking as pending", value);
      setPendingNavigation(value);
      return;
    }
    
    // Throttle if there have been too many attempts in a short time
    if (throttler.shouldThrottle()) {
      toast.error("Navigation issue detected. Please try again in a moment.");
      return;
    }
    
    // Check if we're in recovery mode from the URL
    const isRecovery = isInRecoveryMode(location.search);
    
    // Start navigation
    startNavigation();
    
    // Set active tab first for immediate UI feedback
    setActiveTab(value);
    
    // Special handling for recovery mode
    if (isRecovery) {
      debug.info("Navigation in recovery mode - using special handling");
      
      // In recovery mode, always replace state and don't initiate new refreshes
      const recoveryPath = buildRecoveryPath(value);
      navigate(recoveryPath, { replace: true });
      
      // Mark navigation as complete quickly
      setTimeout(() => {
        completeNavigation();
        debug.info("Recovery navigation complete");
      }, 100);
      
      return;
    }
    
    // Construct path based on the tab value - default flow
    const newPath = buildTabPath(value); 
    
    // Log the current path and the new path for debugging
    debug.info(`Current path: ${location.pathname + location.search}, New path: ${newPath}`);
    
    // Update URL only if needed
    if (location.pathname + location.search !== newPath) {
      debug.info("Navigating to:", newPath);
      
      // Use replace: true for tabs to prevent history buildup
      navigate(newPath, { replace: true });
      
      // Always refresh messages when switching to messages tab
      if (value === 'messages') {
        debug.info("Switching to messages tab, refreshing data");
        
        performRefresh().finally(() => {
          processPendingNavigation();
        });
      } else {
        // For other tabs, mark as complete more quickly
        setTimeout(() => {
          completeNavigation();
          debug.info("Navigation complete set to true (no refresh needed)");
          processPendingNavigation();
        }, 200);
      }
    } else {
      // Already on correct path, just mark navigation as complete
      navigationComplete.current = true;
      
      // Still refresh if switching to messages tab
      if (value === 'messages') {
        performRefresh()
          .catch(err => {
            console.error("Error refreshing messages on same-path tab change:", err);
          })
          .finally(() => {
            completeNavigation();
            processPendingNavigation();
          });
      } else {
        completeNavigation();
        processPendingNavigation();
      }
    }
  }, [
    navigate,
    activeTab,
    location.pathname,
    location.search,
    setActiveTab,
    navigationComplete,
    debug,
    startNavigation,
    completeNavigation,
    setPendingNavigation,
    performRefresh,
    processPendingNavigation
  ]);

  return {
    handleTabChange,
    loopDetected: throttler.isLoopDetected()
  };
}
