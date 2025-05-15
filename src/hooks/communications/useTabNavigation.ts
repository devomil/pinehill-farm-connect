
import { useCallback } from "react";
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
    
    // Construct path based on the tab value
    const newPath = value === "messages" 
      ? '/communication?tab=messages' 
      : '/communication';
      
    // Log the current path and the new path for debugging
    console.log(`Current path: ${location.pathname + location.search}, New path: ${newPath}`);
    
    // Update URL only if needed
    if (location.pathname + location.search !== newPath) {
      console.log("Navigating to:", newPath);
      
      // Use replace: true for tabs to prevent history buildup
      navigate(newPath, { replace: true });
      
      // Always refresh messages when switching to messages tab
      if (value === 'messages') {
        console.log("Switching to messages tab, refreshing data");
        isRefreshing.current = true;
        
        toast.info("Loading messages...");
        
        refreshMessages()
          .then(() => {
            toast.success("Messages loaded successfully");
          })
          .catch(err => {
            console.error("Error refreshing messages:", err);
            toast.error("Failed to load messages. Please try again.");
          })
          .finally(() => {
            isRefreshing.current = false;
            lastRefreshTime.current = Date.now();
            
            // Mark navigation as complete after a short delay
            setTimeout(() => {
              navigationComplete.current = true;
              console.log("Navigation complete set to true after refresh");
            }, 100);
          });
      } else {
        // For other tabs, mark as complete more quickly
        setTimeout(() => {
          navigationComplete.current = true;
          console.log("Navigation complete set to true (no refresh needed)");
        }, 100);
      }
    } else {
      // Already on correct path, just mark navigation as complete
      navigationComplete.current = true;
      console.log("Already on correct path, navigation complete set to true");
      
      // Still refresh if switching to messages tab
      if (value === 'messages') {
        refreshMessages().catch(err => {
          console.error("Error refreshing messages on same-path tab change:", err);
        });
      }
    }
  }, [navigate, refreshMessages, activeTab, location.pathname, location.search, setActiveTab, navigationComplete, isRefreshing, lastRefreshTime]);

  return { handleTabChange };
}
