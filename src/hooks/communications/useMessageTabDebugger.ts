
import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { createDebugContext } from '@/utils/debugUtils';

/**
 * Debug hook for monitoring Direct Messages tab navigation and state changes
 */
export function useMessageTabDebugger(isActive: boolean) {
  const debug = createDebugContext('MessageTabDebugger');
  const location = useLocation();
  const mountCount = useRef(0);
  const lastQueryParams = useRef<URLSearchParams | null>(null);
  const mountTime = useRef<number>(Date.now());
  const lastError = useRef<Error | null>(null);
  
  // Reset error state
  const resetError = useCallback(() => {
    if (lastError.current) {
      debug.info("Clearing previous navigation error");
      lastError.current = null;
    }
  }, [debug]);
  
  // Monitor mount/unmount cycles to detect instability
  useEffect(() => {
    if (!isActive) return;
    
    try {
      mountCount.current += 1;
      mountTime.current = Date.now();
      
      debug.info(`Messages tab mounted (count: ${mountCount.current})`, {
        url: location.pathname + location.search,
        timestamp: new Date().toISOString()
      });

      // Parse URL parameters
      const urlParams = new URLSearchParams(location.search);
      const tabParam = urlParams.get('tab');
      
      debug.info(`Current tab param: "${tabParam}"`, {
        fullUrl: location.pathname + location.search
      });
      
      // Compare with previous params to detect issues
      if (lastQueryParams.current !== null) {
        const prevTabParam = lastQueryParams.current.get('tab');
        
        if (prevTabParam !== tabParam) {
          debug.info(`Tab param changed from "${prevTabParam}" to "${tabParam}"`);
          
          // If quickly switching between tabs, we may need to reset some state
          if (prevTabParam === null && tabParam === 'messages') {
            resetError();
          }
        }
      }
      
      // Store current params for next comparison
      lastQueryParams.current = urlParams;
      
      // Show toast if there have been excessive mounts in short succession
      if (mountCount.current > 3) {
        debug.warn(`Messages tab mounted ${mountCount.current} times, potential navigation loop`);
        
        if (mountCount.current > 5) {
          // This is a serious problem, we should try to recover
          toast.error("Navigation issue detected. Please refresh the page if problems persist.", {
            id: 'message-tab-recovery',
            duration: 5000
          });
        }
      }
    } catch (error) {
      // Capture any errors during the mount effect
      console.error("Error in message tab debugger:", error);
      lastError.current = error instanceof Error ? error : new Error(String(error));
    }
    
    return () => {
      try {
        const unmountTime = Date.now();
        const duration = unmountTime - mountTime.current;
        
        debug.info(`Messages tab unmounted after ${duration}ms`, {
          url: location.pathname + location.search,
          timestamp: new Date().toISOString()
        });
        
        // Alert if component unmounted very quickly
        if (duration < 500) {
          debug.warn(`Messages tab unmounted suspiciously quickly (${duration}ms)`);
        }
      } catch (error) {
        console.error("Error in message tab debugger cleanup:", error);
      }
    };
  }, [isActive, location, debug, resetError]);
  
  return {
    mountCount: mountCount.current,
    debugInfo: {
      currentUrl: location.pathname + location.search,
      tabParam: new URLSearchParams(location.search).get('tab'),
      mountedAt: mountTime.current,
      errorState: lastError.current ? 'error' : 'ok'
    },
    resetError
  };
}
