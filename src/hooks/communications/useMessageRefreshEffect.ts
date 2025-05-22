
import { useEffect, useRef } from "react";
import { toast } from "sonner";

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
  const toastIdRef = useRef<string | null>(null);
  
  // Auto-refresh messages with much less frequency to reduce server load
  useEffect(() => {
    console.log(`MessageList component mounted at ${new Date().toISOString()}`);
    
    // Clear any existing toast on component mount
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
    
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
            // Only show loading toast on time management page
            if (window.location.pathname === '/time') {
              toastIdRef.current = toast.loading("Loading messages...").toString();
              loadingToastShown.current = true;
              
              // Auto-dismiss after 5 seconds to prevent stuck toasts
              setTimeout(() => {
                if (toastIdRef.current) {
                  toast.dismiss(toastIdRef.current);
                  toastIdRef.current = null;
                  loadingToastShown.current = false;
                }
              }, 5000);
            }
          }
          
          await refreshMessages();
          
          // Update toast with success if still active
          if (toastIdRef.current && window.location.pathname === '/time') {
            toast.success("Messages loaded successfully", {
              id: toastIdRef.current,
              duration: 2000
            });
            toastIdRef.current = null;
            loadingToastShown.current = false;
          }
        } catch (error) {
          console.error("Error during initial message load:", error);
          setLoadingFailed(true);
          
          // Update toast with error if still active
          if (toastIdRef.current && window.location.pathname === '/time') {
            toast.error("Failed to load messages", {
              id: toastIdRef.current
            });
            toastIdRef.current = null;
          }
        } finally {
          initialLoadRef.current = true;
          loadingToastShown.current = false;
        }
      }, 3000); // Increased further to 3000ms
      
      return () => {
        clearTimeout(initialTimer);
        // Clear any active toast
        if (toastIdRef.current) {
          toast.dismiss(toastIdRef.current);
          toastIdRef.current = null;
        }
      };
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
      
      // Clear any active toast on unmount
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    };
  }, [refreshMessages, isAdmin, setLoadingFailed]);

  return { refreshAttemptCount };
}
