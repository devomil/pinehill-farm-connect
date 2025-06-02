
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

// Single instance of throttler to prevent multiple instances
const globalThrottler = new NavigationThrottler();

/**
 * Simplified navigation change hook with aggressive loop prevention
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

  // Handle the navigation to a specific tab with circuit breaker protection
  const handleTabChange = useCallback((value: string) => {
    debug.info(`Tab changing from ${activeTab} to ${value}`);
    
    // Prevent duplicate navigation
    if (activeTab === value) {
      debug.info("Tab already active, skipping navigation");
      return;
    }
    
    // Check circuit breaker status first
    if (globalThrottler.isCircuitBreakerActive()) {
      debug.error("Circuit breaker active - blocking navigation attempt");
      toast.error("Navigation temporarily disabled due to performance issues", {
        description: "Please wait 30 seconds before trying again",
        duration: 5000
      });
      return;
    }
    
    // Check for navigation loop
    const loopDetected = globalThrottler.trackNavigationAttempt();
    
    if (loopDetected) {
      debug.error("Navigation loop detected - circuit breaker activated");
      toast.error("Navigation loop detected - emergency stop activated", {
        description: "Navigation will be disabled for 30 seconds to prevent performance issues",
        duration: 10000,
        id: 'circuit-breaker'
      });
      
      // Force navigation to announcements to break the loop
      navigate('/communication?tab=announcements&emergency=true', { replace: true });
      setActiveTab('announcements');
      
      // Reset navigation state
      navigationInProgress.current = false;
      navigationComplete.current = true;
      
      return;
    }
    
    // Check throttling
    if (globalThrottler.shouldThrottle()) {
      debug.warn("Navigation throttled due to rapid attempts");
      toast.warning("Navigation rate limited", {
        description: "Please wait before switching tabs again",
        duration: 3000
      });
      return;
    }
    
    // Proceed with normal navigation
    processTabChange(value);
    
  }, [
    activeTab, 
    setActiveTab, 
    navigationComplete, 
    navigationInProgress, 
    startNavigation, 
    completeNavigation, 
    setPendingNavigation,
    performRefresh,
    processPendingNavigation,
    navigate,
    debug
  ]);
  
  // Simplified tab change processing
  const processTabChange = useCallback((value: string) => {
    // If navigation is already in progress, ignore this request
    if (navigationInProgress.current) {
      debug.info("Navigation already in progress, ignoring request");
      return;
    }
    
    // Check for recovery mode
    const isRecovery = isInRecoveryMode(location.search);
    
    // Start navigation
    startNavigation();
    
    // Set active tab immediately for UI feedback
    setActiveTab(value);
    
    // Handle recovery mode with minimal processing
    if (isRecovery) {
      debug.info("Recovery mode - simplified navigation");
      const recoveryPath = buildRecoveryPath(value);
      navigate(recoveryPath, { replace: true });
      
      setTimeout(() => {
        completeNavigation();
        debug.info("Recovery navigation complete");
      }, 100);
      
      return;
    }
    
    // Normal navigation path
    const newPath = buildTabPath(value);
    
    // Only navigate if path is different
    if (location.pathname + location.search !== newPath) {
      debug.info("Navigating to:", newPath);
      navigate(newPath, { replace: true });
      
      // For messages tab, perform refresh
      if (value === 'messages') {
        setTimeout(() => {
          performRefresh().finally(() => {
            completeNavigation();
            processPendingNavigation();
          });
        }, 100);
      } else {
        setTimeout(() => {
          completeNavigation();
          processPendingNavigation();
        }, 100);
      }
    } else {
      // Same path, just complete navigation
      if (value === 'messages') {
        performRefresh().finally(() => {
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
    loopDetected: globalThrottler.isLoopDetected(),
    circuitBreakerActive: globalThrottler.isCircuitBreakerActive(),
    throttlerStatus: globalThrottler.getStatus()
  };
}
