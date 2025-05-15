
import { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QueryObserverResult } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const navigate = useNavigate();
  const pendingNavigation = useRef<string | null>(null);
  const navigationInProgress = useRef<boolean>(false);
  const debounceTimerRef = useRef<number | null>(null);

  // Handle tab changes and update the URL to prevent rapid/concurrent navigations
  const handleTabChange = useCallback((value: string) => {
    console.log(`Tab changing from ${activeTab} to ${value}`);
    
    // Prevent duplicate navigation
    if (activeTab === value) {
      console.log("Tab already active, skipping navigation");
      return;
    }

    // If we're currently navigating, store this as the pending navigation
    if (navigationInProgress.current) {
      console.log("Navigation already in progress, marking as pending", value);
      pendingNavigation.current = value;
      return;
    }
    
    // Mark navigation as in progress immediately to prevent flickering
    navigationComplete.current = false;
    navigationInProgress.current = true;
    
    // Set active tab first for immediate UI feedback
    setActiveTab(value);
    
    // Construct path based on the tab value
    const newPath = value === "messages" 
      ? '/communication?tab=messages' 
      : '/communication';
      
    // Log the current path and the new path for debugging
    console.log(`Current path: ${location.pathname + location.search}, New path: ${newPath}`);
    
    // Update URL only if needed
    if (location.pathname + location.search !== newPath) {
      console.log("Navigating to:", newPath);
      
      // Use replace: true for tabs to prevent history buildup - and to preserve the messages tab
      navigate(newPath, { replace: true });
      
      // Always refresh messages when switching to messages tab
      if (value === 'messages') {
        console.log("Switching to messages tab, refreshing data");
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
              console.log("Navigation complete set to true after refresh");
              
              // Check if we have a pending navigation and trigger it
              if (pendingNavigation.current) {
                const nextTab = pendingNavigation.current;
                pendingNavigation.current = null;
                console.log("Processing pending navigation to", nextTab);
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
          console.log("Navigation complete set to true (no refresh needed)");
          
          // Check if we have a pending navigation
          if (pendingNavigation.current) {
            const nextTab = pendingNavigation.current;
            pendingNavigation.current = null;
            console.log("Processing pending navigation to", nextTab);
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
  }, [navigate, refreshMessages, activeTab, location.pathname, location.search, setActiveTab, navigationComplete, isRefreshing, lastRefreshTime]);

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
    navigationInProgress
  };
}
