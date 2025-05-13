
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface UseTabNavigationProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  location: { pathname: string; search: string };
  navigationComplete: React.MutableRefObject<boolean>;
  refreshMessages: () => Promise<void>;
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
    setActiveTab(value);
    navigationComplete.current = false;
    
    const newPath = value === "messages" 
      ? '/communication?tab=messages' 
      : '/communication';
      
    // Update URL without full page reload
    if (location.pathname + location.search !== newPath) {
      navigate(newPath, { replace: true });
      
      // Only refresh if it's been more than 5 seconds since last refresh
      const now = Date.now();
      if (now - lastRefreshTime.current > 5000 && !isRefreshing.current) {
        console.log("Refreshing messages on tab change");
        isRefreshing.current = true;
        refreshMessages().finally(() => {
          isRefreshing.current = false;
          lastRefreshTime.current = Date.now();
          navigationComplete.current = true;
        });
      } else {
        navigationComplete.current = true;
      }
    }
  }, [navigate, refreshMessages, activeTab, location.pathname, location.search, setActiveTab, navigationComplete, isRefreshing, lastRefreshTime]);

  return { handleTabChange };
}
