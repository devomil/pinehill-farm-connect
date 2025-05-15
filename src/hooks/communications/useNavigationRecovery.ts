
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  const debug = useDebug('NavigationRecovery', {
    traceLifecycle: true,
    logStateChanges: true
  });

  // Effect to sync the URL with the active tab on mount and location changes
  useEffect(() => {
    // Check for recovery parameter in URL - this helps break navigation loops
    const urlParams = new URLSearchParams(location.search);
    const isRecoveryMode = urlParams.get('recovery') === 'true';
    
    if (isRecoveryMode) {
      // In recovery mode, we ensure navigation is marked as complete
      navigationComplete.current = true;
      debug.info("Running in navigation recovery mode");
      
      // Force debug mode on in recovery
      if (!showDebugInfo) {
        setShowDebugInfo(true);
      }
      
      // Clear recovery parameter but maintain tab parameter
      if (urlParams.has('recovery')) {
        urlParams.delete('recovery');
        const newSearch = urlParams.toString() ? `?${urlParams.toString()}` : '';
        window.history.replaceState(null, '', `${location.pathname}${newSearch}`);
      }
      return;
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
      navigationInProgress, showDebugInfo, setShowDebugInfo]);
}
