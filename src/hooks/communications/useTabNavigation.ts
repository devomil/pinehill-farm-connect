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
    
    // Prevent duplicate navigation
    if (activeTab === value) {
      console.log("Tab already active, skipping navigation");
      return;
    }
    
    // Mark navigation as in progress immediately to prevent flickering
    navigationComplete.current = false;
    
    // Set active tab first for immediate UI feedback
    setActiveTab(value);
    
    // Keep user on the communication page when changing tabs
    const newPath = value === "messages" 
      ? '/communication?tab=messages' 
      : '/communication';
      
    // Log the current path and the new path for debugging
    console.log(`Current path: ${location.pathname + location.search}, New path: ${newPath}`);
    
    // Update URL only if needed
    if (location.pathname + location.search !== newPath) {
      console.log("Navigating to:", newPath);
      
      // Use replace: true to prevent adding multiple history entries
      // This helps prevent back button issues
      navigate(newPath, { replace: true });
      
      // Only refresh if it's been more than 2 seconds since last refresh
      const now = Date.now();
      if (now - lastRefreshTime.current > 2000 && !isRefreshing.current) {
        console.log("Refreshing messages on tab change");
        isRefreshing.current = true;
        
        setTimeout(() => {
          refreshMessages()
            .finally(() => {
              isRefreshing.current = false;
              lastRefreshTime.current = Date.now();
              
              // Mark navigation as complete after a short delay
              setTimeout(() => {
                navigationComplete.current = true;
                console.log("Navigation complete set to true after refresh");
              }, 100);
            });
        }, 100);
      } else {
        // Mark navigation as complete after a short delay if not refreshing
        setTimeout(() => {
          navigationComplete.current = true;
          console.log("Navigation complete set to true (no refresh needed)");
        }, 100);
      }
    } else {
      // Already on correct path, just mark navigation as complete
      navigationComplete.current = true;
      console.log("Already on correct path, navigation complete set to true");
    }
  }, [navigate, refreshMessages, activeTab, location.pathname, location.search, setActiveTab, navigationComplete, isRefreshing, lastRefreshTime]);

  return { handleTabChange };
}
