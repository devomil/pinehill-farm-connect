
import { useEffect } from 'react';
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

  // Effect to sync the URL with the active tab on mount and location changes
  useEffect(() => {
    // Check for recovery parameter in URL - this helps break navigation loops
    const urlParams = new URLSearchParams(location.search);
    const isRecoveryMode = urlParams.get('recovery') === 'true';
    const isMessagesTab = urlParams.get('tab') === 'messages';
    
    // Special handling for recovery mode
    if (isRecoveryMode) {
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
            const newSearch = newParams.toString() ? `?${newParams.toString()}` : '';
            window.history.replaceState(null, '', `${location.pathname}${newSearch}`);
            debug.info("Cleared recovery parameters after stabilization");
          }
        }, 3000);
      }
      return;
    }
    
    // Special handling for messages tab - if we detect it's causing issues
    if (isMessagesTab && navigationInProgress.current && !navigationComplete.current) {
      // If we detect we've been stuck too long trying to load messages tab,
      // force navigation to complete to break potential loops
      setTimeout(() => {
        if (navigationInProgress.current && !navigationComplete.current) {
          debug.warn("Detected stuck navigation to messages tab, forcing completion");
          navigationComplete.current = true;
          navigationInProgress.current = false;
        }
      }, 5000);
    }
    
    // Only run this effect if navigation is complete to prevent loops
    if (!navigationComplete.current) {
      debug.info("Skipping URL sync, navigation in progress");
      return;
    }
    
    // Parse URL parameters and update active tab if needed
    const tabParam = urlParams.get('tab');
    const newTab = tabParam === 'messages' ? "messages" : "announcements";
    
    if (newTab !== activeTab) {
      debug.info("Syncing tab from URL", { urlTab: newTab, currentTab: activeTab });
      setActiveTab(newTab);
      
      // If switching to messages tab via direct URL, ensure messages are refreshed
      if (newTab === 'messages' && !navigationInProgress?.current) {
        debug.info("Direct URL navigation to messages tab, refreshing data");
        refreshMessages().catch(err => {
          console.error("Error refreshing messages during URL sync:", err);
          toast.error("Failed to load messages");
        });
      }
    }
  }, [location, debug, activeTab, setActiveTab, navigationComplete, refreshMessages, 
      navigationInProgress, showDebugInfo, setShowDebugInfo, navigate]);
}
