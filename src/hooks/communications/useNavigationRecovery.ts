
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDebug } from '@/hooks/useDebug';
import { toast } from 'sonner';

interface NavigationRecoveryProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navigationComplete: React.MutableRefObject<boolean>;
  refreshMessages: () => Promise<void>;
  navigationInProgress: React.MutableRefObject<boolean>;
  showDebugInfo: boolean;
  setShowDebugInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useNavigationRecovery({
  activeTab,
  setActiveTab,
  navigationComplete,
  refreshMessages,
  navigationInProgress,
  showDebugInfo,
  setShowDebugInfo
}: NavigationRecoveryProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const debug = useDebug('NavigationRecovery', {
    traceLifecycle: true,
    logStateChanges: true
  });
  
  // Track if we've already processed a tab update for this render
  const hasProcessedTabUpdate = useRef(false);
  // Track if we've refreshed data for this tab
  const hasRefreshedData = useRef(false);
  // Track the number of navigation recovery attempts
  const recoveryAttempts = useRef(0);

  // Effect to sync the URL with the active tab on mount and location changes
  useEffect(() => {
    // Check for recovery parameter in URL - this helps break navigation loops
    const urlParams = new URLSearchParams(location.search);
    const recoveryRequested = urlParams.get('recovery') === 'true';
    const tabParam = urlParams.get('tab');
    
    // Skip processing if we've already done it for this render
    if (hasProcessedTabUpdate.current) {
      return;
    }
    
    // Force sync tab from URL parameter
    if (tabParam) {
      // Only use valid tab values
      const newTab = tabParam === 'messages' ? "messages" : "announcements";
      
      // If there's a tab parameter but active tab doesn't match, fix it
      if (newTab !== activeTab) {
        debug.info(`Tab parameter (${newTab}) doesn't match active tab (${activeTab}). Syncing.`);
        
        // Set the active tab to match URL - this is crucial
        setActiveTab(newTab);
        hasProcessedTabUpdate.current = true;
        
        // If we're in recovery mode, handle with more care
        if (recoveryRequested) {
          debug.info("Recovery mode detected, ensuring state stability");
          
          // Increment recovery attempts
          recoveryAttempts.current++;
          
          // If we've tried recovery too many times, force navigation to announcements
          if (recoveryAttempts.current > 3 && newTab === 'messages') {
            debug.warn(`Too many recovery attempts (${recoveryAttempts.current}), redirecting to announcements`);
            setTimeout(() => {
              navigate('/communication?tab=announcements', { replace: true });
              toast.warning("Navigation issues detected - redirecting to announcements tab", {
                duration: 4000
              });
            }, 500);
            return;
          }
          
          // Mark navigation as complete to prevent loops
          navigationComplete.current = true;
          navigationInProgress.current = false;
        }
      }
    } else if (location.pathname === '/communication' && !tabParam) {
      // If we're on the communication page with no tab param, default to announcements
      debug.info("No tab parameter found, defaulting to announcements");
      navigate('/communication?tab=announcements', { replace: true });
      setActiveTab('announcements');
      hasProcessedTabUpdate.current = true;
    }
    
    // Special handling for recovery mode
    if (recoveryRequested) {
      // In recovery mode, we ensure navigation is marked as complete
      navigationComplete.current = true;
      debug.info("Running in navigation recovery mode");
      
      // Force debug mode on in recovery
      if (!showDebugInfo) {
        setShowDebugInfo(true);
      }
      
      // Clear navigation in progress flag to prevent deadlocks
      if (navigationInProgress.current) {
        navigationInProgress.current = false;
        debug.info("Cleared navigation in progress flag during recovery");
      }
      
      // After a reasonable delay, clear the recovery flag
      if (urlParams.has('ts')) {
        setTimeout(() => {
          // Only modify URL if we're still on the same page
          if (document.location.pathname.includes('communication')) {
            const newParams = new URLSearchParams(location.search);
            newParams.delete('recovery');
            newParams.delete('ts');
            
            // KEEP the tab parameter!
            const tabValue = newParams.get('tab') || activeTab || 'announcements';
            newParams.set('tab', tabValue);
            
            const newSearch = newParams.toString() ? `?${newParams.toString()}` : '';
            // Use history.replaceState to avoid triggering new navigation events
            window.history.replaceState(null, '', `${location.pathname}${newSearch}`);
            debug.info("Cleared recovery parameters after stabilization");
            
            // Reset recovery attempts counter
            recoveryAttempts.current = 0;
          }
        }, 5000);
      }
    }

    // Reset the tab update flag after processing
    setTimeout(() => {
      hasProcessedTabUpdate.current = false;
    }, 100);

    // Only perform refresh if navigation is complete, we're on messages tab, and we haven't refreshed already
    if (navigationComplete.current && 
        tabParam === 'messages' && 
        activeTab === 'messages' && 
        !navigationInProgress.current && 
        !hasRefreshedData.current) {
        
      // Set this flag to prevent multiple refreshes
      hasRefreshedData.current = true;
      
      // Use a longer delay to avoid excessive refreshes
      const refreshTimer = setTimeout(() => {
        debug.info("Refreshing messages data after URL sync");
        refreshMessages().catch(err => {
          console.error("Error refreshing messages during URL sync:", err);
        });
        
        // Reset this flag after some time
        setTimeout(() => {
          hasRefreshedData.current = false;
        }, 10000);
      }, 1500);
      
      return () => clearTimeout(refreshTimer);
    }
  }, [location, debug, activeTab, setActiveTab, navigationComplete, refreshMessages, 
      navigationInProgress, showDebugInfo, setShowDebugInfo, navigate]);
}
