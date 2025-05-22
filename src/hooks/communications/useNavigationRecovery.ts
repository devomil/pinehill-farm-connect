
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
      
      // CRITICAL: If there's a tab parameter but active tab doesn't match, fix it immediately
      if (newTab !== activeTab) {
        debug.info(`Tab parameter (${newTab}) doesn't match active tab (${activeTab}). Forcing sync.`);
        
        // Set the active tab to match URL - this is crucial
        setActiveTab(newTab);
        hasProcessedTabUpdate.current = true;
        
        // If we're in recovery mode, we need more assertive handling
        if (recoveryRequested) {
          debug.info("Recovery mode detected, ensuring URL and tab state are in sync");
          
          // Hard sync to match URL parameter - overriding any UI state
          setTimeout(() => {
            const updatedParams = new URLSearchParams(location.search);
            updatedParams.set('tab', newTab);
            updatedParams.set('recovery', 'true');
            const path = `${location.pathname}?${updatedParams.toString()}`;
            
            if (location.pathname + location.search !== path) {
              debug.info(`Forced URL update in recovery mode: ${path}`);
              navigate(path, { replace: true });
            }
          }, 100);
        }
        
        // Mark navigation as complete to prevent loops
        navigationComplete.current = true;
        navigationInProgress.current = false;
      }
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
      
      // Don't immediately clear recovery flag - let it help stabilize first
      if (urlParams.has('ts')) {
        // After the page has had time to stabilize with recovery mode,
        // we can clear the recovery flag
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
            window.history.replaceState(null, '', `${location.pathname}${newSearch}`);
            debug.info("Cleared recovery parameters after stabilization");
          }
        }, 8000); // Extended time to ensure stable before removing recovery flag
      }
    }

    // Reset the tab update flag on next frame
    requestAnimationFrame(() => {
      hasProcessedTabUpdate.current = false;
    });

    // Only perform refresh if navigation is complete and we're on messages tab
    if (navigationComplete.current && tabParam === 'messages' && activeTab === 'messages' && !navigationInProgress.current) {
      // If switching to messages tab via direct URL, ensure messages are refreshed
      // But use a longer delay to avoid excessive refreshes
      const refreshTimer = setTimeout(() => {
        debug.info("Refreshing messages data after URL sync");
        refreshMessages().catch(err => {
          console.error("Error refreshing messages during URL sync:", err);
          toast.error("Failed to load messages");
        });
      }, 1500);
      
      return () => clearTimeout(refreshTimer);
    }
  }, [location, debug, activeTab, setActiveTab, navigationComplete, refreshMessages, 
      navigationInProgress, showDebugInfo, setShowDebugInfo, navigate]);
}
