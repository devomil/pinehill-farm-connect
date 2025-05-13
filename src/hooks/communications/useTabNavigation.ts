
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { QueryObserverResult } from "@tanstack/react-query";

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

  // Handle tab changes and update the URL
  const handleTabChange = useCallback((value: string) => {
    console.log(`Tab changing from ${activeTab} to ${value}`);
    
    // Set active tab first
    setActiveTab(value);
    
    // Mark navigation as in progress
    navigationComplete.current = false;
    
    // Keep user on the communication page when changing tabs
    const newPath = value === "messages" 
      ? '/communication?tab=messages' 
      : '/communication';
      
    // Log the current path and the new path for debugging
    console.log(`Current path: ${location.pathname + location.search}, New path: ${newPath}`);
    
    // Update URL without full page reload - only if needed
    if (location.pathname + location.search !== newPath) {
      console.log("Navigating to:", newPath);
      
      // CRITICAL: Use replace: false to create a proper history entry
      // This prevents redirecting away from the page
      navigate(newPath, { replace: false });
      
      // Only refresh if it's been more than 5 seconds since last refresh
      const now = Date.now();
      if (now - lastRefreshTime.current > 5000 && !isRefreshing.current) {
        console.log("Refreshing messages on tab change");
        isRefreshing.current = true;
        
        // Run refresh as a separate process to not block navigation
        setTimeout(() => {
          refreshMessages()
            .finally(() => {
              if (navigationComplete) {
                isRefreshing.current = false;
                lastRefreshTime.current = Date.now();
                
                // Ensure navigation is marked as complete only after refresh finishes
                setTimeout(() => {
                  navigationComplete.current = true;
                  console.log("Navigation complete set to true after refresh");
                }, 150);
              }
            });
        }, 100);
      } else {
        // Mark navigation as complete immediately if not refreshing
        setTimeout(() => {
          navigationComplete.current = true;
          console.log("Navigation complete set to true immediately");
        }, 100);
      }
    } else {
      // If we're already on the correct path, just mark navigation as complete
      navigationComplete.current = true;
      console.log("Already on correct path, navigation complete set to true");
    }
  }, [navigate, refreshMessages, activeTab, location.pathname, location.search, setActiveTab, navigationComplete, isRefreshing, lastRefreshTime]);

  return { handleTabChange };
}
