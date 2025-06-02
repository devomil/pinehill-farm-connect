
import { useCallback, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SimpleNavigationResult {
  handleTabChange: (tab: string) => void;
  isNavigating: boolean;
  resetNavigation: () => void;
}

/**
 * Simplified tab navigation hook to prevent loops
 */
export function useSimplifiedTabNavigation(
  activeTab: string,
  setActiveTab: (tab: string) => void
): SimpleNavigationResult {
  const location = useLocation();
  const navigate = useNavigate();
  const isNavigating = useRef(false);
  const lastNavigation = useRef(0);
  const navigationCount = useRef(0);
  const emergencyStop = useRef(false);

  // Emergency reset function
  const resetNavigation = useCallback(() => {
    isNavigating.current = false;
    navigationCount.current = 0;
    emergencyStop.current = false;
    lastNavigation.current = 0;
    
    // Clear any problematic session storage
    window.sessionStorage.removeItem('communication_recovery');
    window.sessionStorage.removeItem('message_tab_recovery_needed');
    
    // Force navigation to safe state
    navigate('/communication?tab=announcements', { replace: true });
    setActiveTab('announcements');
    
    toast.success("Navigation reset completed");
  }, [navigate, setActiveTab]);

  // Simplified tab change handler
  const handleTabChange = useCallback((newTab: string) => {
    const now = Date.now();
    
    // Emergency stop if too many navigation attempts
    if (navigationCount.current > 10) {
      if (!emergencyStop.current) {
        emergencyStop.current = true;
        toast.error("Navigation emergency stop activated", {
          description: "Too many navigation attempts detected",
          duration: 10000
        });
      }
      return;
    }
    
    // Prevent rapid navigation
    if (now - lastNavigation.current < 1000) {
      console.log("Navigation throttled - too rapid");
      return;
    }
    
    // Skip if already on target tab
    if (newTab === activeTab && !isNavigating.current) {
      console.log(`Already on ${newTab} tab`);
      return;
    }
    
    // Skip if already navigating
    if (isNavigating.current) {
      console.log("Navigation already in progress");
      return;
    }
    
    console.log(`Simple navigation: ${activeTab} -> ${newTab}`);
    
    isNavigating.current = true;
    navigationCount.current++;
    lastNavigation.current = now;
    
    // Set tab immediately for UI responsiveness
    setActiveTab(newTab);
    
    // Navigate with minimal processing
    const newPath = `/communication?tab=${newTab}`;
    if (location.pathname + location.search !== newPath) {
      navigate(newPath, { replace: true });
    }
    
    // Complete navigation after brief delay
    setTimeout(() => {
      isNavigating.current = false;
      console.log(`Navigation to ${newTab} completed`);
    }, 300);
    
  }, [activeTab, setActiveTab, location, navigate]);

  // Sync with URL on mount/location change
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlTab = urlParams.get('tab');
    
    if (urlTab && urlTab !== activeTab && !isNavigating.current) {
      console.log(`Syncing tab from URL: ${urlTab}`);
      setActiveTab(urlTab);
    }
  }, [location.search, activeTab, setActiveTab]);

  // Auto-reset navigation count periodically
  useEffect(() => {
    const resetTimer = setInterval(() => {
      if (navigationCount.current > 0) {
        navigationCount.current = Math.max(0, navigationCount.current - 1);
      }
      if (emergencyStop.current && navigationCount.current === 0) {
        emergencyStop.current = false;
        console.log("Emergency stop lifted");
      }
    }, 5000);

    return () => clearInterval(resetTimer);
  }, []);

  return {
    handleTabChange,
    isNavigating: isNavigating.current,
    resetNavigation
  };
}
