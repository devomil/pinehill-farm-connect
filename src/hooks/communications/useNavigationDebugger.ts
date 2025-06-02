
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDebug } from "../useDebug";
import { toast } from "sonner";

export function useNavigationDebugger() {
  const location = useLocation();
  const navigate = useNavigate();
  const debug = useDebug('NavigationDebugger');
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [timeInMessagesTab, setTimeInMessagesTab] = useState(0);
  const [hasLoopDetected, setHasLoopDetected] = useState(false);
  
  const messagesTabStartTime = useRef<number | null>(null);
  const lastLocationRef = useRef(location);
  const rapidNavigationCount = useRef(0);
  const lastNavigationTime = useRef(Date.now());

  // Recovery function to attempt to fix navigation issues
  const attemptRecovery = useCallback(() => {
    debug.info('Attempting navigation recovery');
    
    // Reset all counters
    setTabSwitchCount(0);
    rapidNavigationCount.current = 0;
    setHasLoopDetected(false);
    lastNavigationTime.current = Date.now();
    
    // Clear any problematic session storage
    window.sessionStorage.removeItem('communication_recovery');
    window.sessionStorage.removeItem('message_tab_recovery_needed');
    localStorage.removeItem('last_communication_tab');
    
    // Navigate to a safe state (announcements tab)
    navigate('/communication?tab=announcements', { replace: true });
    
    toast.success("Navigation recovery attempted", {
      description: "Counters reset and navigated to safe state"
    });
  }, [debug, navigate]);

  // Track time spent in messages tab
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const currentTab = urlParams.get('tab');
    
    if (currentTab === 'messages') {
      if (!messagesTabStartTime.current) {
        messagesTabStartTime.current = Date.now();
      }
    } else {
      messagesTabStartTime.current = null;
    }
    
    const updateTimer = setInterval(() => {
      if (messagesTabStartTime.current) {
        setTimeInMessagesTab(Date.now() - messagesTabStartTime.current);
      }
    }, 100);
    
    return () => clearInterval(updateTimer);
  }, [location.search]);

  // Enhanced navigation tracking with lower thresholds
  useEffect(() => {
    const prevPath = lastLocationRef.current.pathname + lastLocationRef.current.search;
    const currentPath = location.pathname + location.search;
    const now = Date.now();
    
    if (prevPath !== currentPath) {
      setTabSwitchCount(prev => {
        const newCount = prev + 1;
        
        // Lower emergency threshold to 50 for faster detection
        if (newCount >= 50) {
          setHasLoopDetected(true);
          debug.warn('Navigation loop detected at lower threshold', { 
            count: newCount,
            path: currentPath 
          });
        }
        
        return newCount;
      });
      
      // Track rapid navigation (within 1 second)
      if (now - lastNavigationTime.current < 1000) {
        rapidNavigationCount.current++;
        
        // If we have 10+ rapid navigations, consider it an emergency
        if (rapidNavigationCount.current >= 10) {
          setHasLoopDetected(true);
          debug.error('Rapid navigation emergency detected', {
            rapidCount: rapidNavigationCount.current,
            totalCount: tabSwitchCount
          });
        }
      } else {
        // Reset rapid navigation counter if enough time has passed
        rapidNavigationCount.current = 0;
      }
      
      lastNavigationTime.current = now;
      lastLocationRef.current = location;
    }
  }, [location, debug, tabSwitchCount]);

  // Auto-reset counters after a period of stability
  useEffect(() => {
    const resetTimer = setTimeout(() => {
      if (tabSwitchCount > 0) {
        setTabSwitchCount(0);
        rapidNavigationCount.current = 0;
        setHasLoopDetected(false);
        debug.info('Navigation counters reset after stability period');
      }
    }, 30000); // Reset after 30 seconds of stability

    return () => clearTimeout(resetTimer);
  }, [tabSwitchCount, debug]);

  return {
    tabSwitchCount,
    timeInMessagesTab,
    hasLoopDetected,
    rapidNavigationCount: rapidNavigationCount.current,
    attemptRecovery
  };
}
