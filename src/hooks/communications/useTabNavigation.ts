
import { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QueryObserverResult } from "@tanstack/react-query";
import { toast } from "sonner";
import { createDebugContext } from "@/utils/debugUtils";

interface UseTabNavigationProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  location: { pathname: string; search: string };
  navigationComplete: React.MutableRefObject<boolean>;
  refreshMessages: () => Promise<void | QueryObserverResult<any, Error>>;
  isRefreshing: React.MutableRefObject<boolean>;
  lastRefreshTime: React.MutableRefObject<number>;
}

export function useTabNavigation({
  activeTab,
  setActiveTab,
  location,
  navigationComplete,
  refreshMessages,
  isRefreshing,
  lastRefreshTime
}: UseTabNavigationProps) {
  const debug = createDebugContext('TabNavigation');
  const navigate = useNavigate();
  const pendingNavigation = useRef<string | null>(null);
  const navigationInProgress = useRef<boolean>(false);
  const debounceTimerRef = useRef<number | null>(null);
  const errorCountRef = useRef<number>(0);
  const lastAttemptRef = useRef<number>(Date.now());
  const navigationsWithinPeriod = useRef<number>(0);
  const loopDetected = useRef<boolean>(false);

  // Handle tab changes and update the URL to prevent rapid/concurrent navigations
  const handleTabChange = useCallback((value: string) => {
    debug.info(`Tab changing from ${activeTab} to ${value}`);
    
    // Prevent duplicate navigation
    if (activeTab === value) {
      debug.info("Tab already active, skipping navigation");
      return;
    }
    
    // Check for a navigation loop by tracking rapid requests within a window
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptRef.current;
    
    // If less than 1.5 seconds since last navigation, track it as frequent
    if (timeSinceLastAttempt < 1500) {
      navigationsWithinPeriod.current += 1;
      debug.warn(`Rapid navigation: ${navigationsWithinPeriod.current} within 1.5s window`);
      
      // If we have 3 or more rapid navigations, this might be a loop
      if (navigationsWithinPeriod.current >= 3) {
        loopDetected.current = true;
        debug.error("Navigation loop detected");
        
        // Show a toast but don't block navigation
        toast.error("Navigation loop detected", {
          description: "Use the debug panel to fix this issue",
          id: 'navigation-loop'
        });
      }
    } else {
      // Reset counter if enough time has passed
      navigationsWithinPeriod.current = 0;
    }
    
    lastAttemptRef.current = now;

    // If navigation is already in progress, store this as the pending navigation
    if (navigationInProgress.current) {
      debug.info("Navigation already in progress, marking as pending", value);
      pendingNavigation.current = value;
      return;
    }
    
    // Throttle if there have been too many attempts in a short time
    if (timeSinceLastAttempt < 1000) {
      debug.info("Throttling navigation attempt - too many requests");
      
      if (errorCountRef.current > 3) {
        debug.warn("Too many navigation attempts, possibly in a loop");
        toast.error("Navigation issue detected. Please try again in a moment.");
        setTimeout(() => {
          errorCountRef.current = 0;
        }, 5000);
        return;
      }
      
      errorCountRef.current++;
    } else {
      // Reset error count if enough time has passed
      errorCountRef.current = 0;
    }
    
    // Check if we're in recovery mode from the URL
    const urlParams = new URLSearchParams(location.search);
    const isRecovery = urlParams.get('recovery') === 'true';
    
    // Mark navigation as in progress immediately to prevent flickering
    navigationComplete.current = false;
    navigationInProgress.current = true;
    
    // Set active tab first for immediate UI feedback
    setActiveTab(value);
    
    // Special handling for recovery mode
    if (isRecovery) {
      debug.info("Navigation in recovery mode - using special handling");
      
      // In recovery mode, always replace state and don't initiate new refreshes
      const recoveryPath = value === "messages" 
        ? '/communication?tab=messages&recovery=true' 
        : '/communication?recovery=true';
        
      navigate(recoveryPath, { replace: true });
      
      // Mark navigation as complete quickly
      setTimeout(() => {
        navigationComplete.current = true;
        navigationInProgress.current = false;
        debug.info("Recovery navigation complete");
      }, 100);
      
      return;
    }
    
    // Construct path based on the tab value - default flow
    const newPath = value === "messages" 
      ? '/communication?tab=messages' 
      : '/communication';
      
    // Log the current path and the new path for debugging
    debug.info(`Current path: ${location.pathname + location.search}, New path: ${newPath}`);
    
    // Update URL only if needed
    if (location.pathname + location.search !== newPath) {
      debug.info("Navigating to:", newPath);
      
      // Use replace: true for tabs to prevent history buildup - and to preserve the messages tab
      navigate(newPath, { replace: true });
      
      // Always refresh messages when switching to messages tab
      if (value === 'messages') {
        debug.info("Switching to messages tab, refreshing data");
        isRefreshing.current = true;
        
        // Show a loading toast instead of a separate info toast
        const loadingToast = toast.loading("Loading messages...");
        
        refreshMessages()
          .then(() => {
            // Update the loading toast to success
            toast.success("Messages loaded successfully", {
              id: loadingToast
            });
          })
          .catch(err => {
            console.error("Error refreshing messages:", err);
            toast.error("Failed to load messages. Please try again.", {
              id: loadingToast
            });
          })
          .finally(() => {
            isRefreshing.current = false;
            lastRefreshTime.current = Date.now();
            
            // Mark navigation as complete after a short delay
            setTimeout(() => {
              navigationComplete.current = true;
              navigationInProgress.current = false;
              debug.info("Navigation complete set to true after refresh");
              
              // Check if we have a pending navigation and trigger it
              if (pendingNavigation.current) {
                const nextTab = pendingNavigation.current;
                pendingNavigation.current = null;
                debug.info("Processing pending navigation to", nextTab);
                setTimeout(() => {
                  handleTabChange(nextTab);
                }, 100);
              }
            }, 300); // Increased delay to ensure everything is ready
          });
      } else {
        // For other tabs, mark as complete more quickly
        setTimeout(() => {
          navigationComplete.current = true;
          navigationInProgress.current = false;
          debug.info("Navigation complete set to true (no refresh needed)");
          
          // Check if we have a pending navigation
          if (pendingNavigation.current) {
            const nextTab = pendingNavigation.current;
            pendingNavigation.current = null;
            debug.info("Processing pending navigation to", nextTab);
            setTimeout(() => {
              handleTabChange(nextTab);
            }, 100);
          }
        }, 200);
      }
    } else {
      // Already on correct path, just mark navigation as complete
      navigationComplete.current = true;
      
      // Still refresh if switching to messages tab
      if (value === 'messages') {
        refreshMessages()
          .catch(err => {
            console.error("Error refreshing messages on same-path tab change:", err);
          })
          .finally(() => {
            navigationInProgress.current = false;
            
            // Check if we have a pending navigation
            if (pendingNavigation.current) {
              const nextTab = pendingNavigation.current;
              pendingNavigation.current = null;
              setTimeout(() => {
                handleTabChange(nextTab);
              }, 100);
            }
          });
      } else {
        navigationInProgress.current = false;
        
        // Check if we have a pending navigation
        if (pendingNavigation.current) {
          const nextTab = pendingNavigation.current;
          pendingNavigation.current = null;
          setTimeout(() => {
            handleTabChange(nextTab);
          }, 100);
        }
      }
    }
  }, [navigate, refreshMessages, activeTab, location.pathname, location.search, setActiveTab, navigationComplete, isRefreshing, lastRefreshTime, debug]);

  // Create our own simple debounce function instead of depending on lodash
  const debouncedTabChange = useCallback(
    (value: string) => {
      // Clear any existing timeout
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Set a new timeout
      debounceTimerRef.current = window.setTimeout(() => {
        handleTabChange(value);
        debounceTimerRef.current = null;
      }, 300) as unknown as number;
    }, 
    [handleTabChange]
  );

  return { 
    handleTabChange: debouncedTabChange,
    navigationInProgress,
    loopDetected
  };
}
