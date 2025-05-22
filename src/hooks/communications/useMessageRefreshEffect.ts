
import { useEffect, useRef } from "react";

interface RefreshEffectOptions {
  refreshMessages: () => Promise<void>;
  isAdmin: boolean;
  setLoadingFailed: (failed: boolean) => void;
}

export function useMessageRefreshEffect({ 
  refreshMessages, 
  isAdmin,
  setLoadingFailed
}: RefreshEffectOptions) {
  const refreshIntervalRef = useRef<number | null>(null);
  const initialLoadRef = useRef<boolean>(false);
  const componentMountedAt = useRef(Date.now());
  const refreshAttemptCount = useRef(0);
  const MAX_AUTO_REFRESHES = 1; // Reduced to only 1 auto-refresh
  const loadingToastShown = useRef<boolean>(false);
  
  // Auto-refresh messages with much less frequency to reduce server load
  useEffect(() => {
    console.log(`MessageList component mounted at ${new Date().toISOString()}`);
    
    // Clear any existing interval when component re-renders
    if (refreshIntervalRef.current !== null) {
      clearInterval(refreshIntervalRef.current);
    }
    
    // Initial load only once - with error handling and a longer delay
    if (!initialLoadRef.current) {
      console.log("Initial message list data load");
      
      // Delay initial refresh to ensure component is fully mounted
      const initialTimer = setTimeout(async () => {
        try {
          if (!loadingToastShown.current) {
            // Avoid showing loading toast on every refresh
            loadingToastShown.current = true;
          }
          
          await refreshMessages();
        } catch (error) {
          console.error("Error during initial message load:", error);
          setLoadingFailed(true);
        } finally {
          initialLoadRef.current = true;
        }
      }, 3000); // Increased further to 3000ms
      
      return () => clearTimeout(initialTimer);
    }
    
    // Set up refresh interval with much longer timing and limited refreshes
    const refreshHandler = async () => {
      // Don't refresh if we've hit the limit
      if (refreshAttemptCount.current >= MAX_AUTO_REFRESHES) {
        console.log(`Auto-refresh limit reached (${MAX_AUTO_REFRESHES}), stopping automatic refreshes`);
        if (refreshIntervalRef.current !== null) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
        return;
      }
      
      console.log(`Auto-refreshing message list (${refreshAttemptCount.current + 1}/${MAX_AUTO_REFRESHES})`);
      refreshAttemptCount.current++;
      
      try {
        await refreshMessages();
        setLoadingFailed(false);
      } catch (error) {
        console.error("Error during auto-refresh:", error);
        // Don't set loading failed for background refreshes
      }
    };
    
    // Extremely limited refresh intervals
    const interval = window.setInterval(refreshHandler, isAdmin ? 600000 : 900000); // 10-15 minutes (greatly extended)
    
    refreshIntervalRef.current = interval as unknown as number;
    
    return () => {
      console.log(`MessageList component unmounting after ${Date.now() - componentMountedAt.current}ms`);
      if (refreshIntervalRef.current !== null) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshMessages, isAdmin, setLoadingFailed]);

  return { refreshAttemptCount };
}
