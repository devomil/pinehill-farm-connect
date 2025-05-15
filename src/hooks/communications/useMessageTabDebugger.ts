
import { useEffect, useRef, useCallback, useState } from 'react';
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
  const [tabMetrics, setTabMetrics] = useState({
    avgMountTime: 0,
    hasEverMounted: false,
  });
  
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
      
      // Update metrics
      setTabMetrics(prev => ({
        ...prev,
        hasEverMounted: true
      }));

      // Parse URL parameters
      const urlParams = new URLSearchParams(location.search);
      const tabParam = urlParams.get('tab');
      const isRecoveryMode = urlParams.get('recovery') === 'true';
      
      debug.info(`Current tab param: "${tabParam}", recovery mode: ${isRecoveryMode}`, {
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
        
        if (mountCount.current > 5 && !isRecoveryMode) {
          // This is a serious problem, we should try to recover
          toast.error("Navigation issue detected", {
            id: 'message-tab-recovery-needed',
            description: "Try the recovery button to fix this issue",
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
        
        // Update the average mount time metric
        setTabMetrics(prev => ({
          ...prev,
          avgMountTime: prev.avgMountTime === 0 
            ? duration 
            : (prev.avgMountTime * 0.7 + duration * 0.3) // weighted average
        }));
        
        // Alert if component unmounted very quickly
        if (duration < 500) {
          debug.warn(`Messages tab unmounted suspiciously quickly (${duration}ms)`, {
            navigationCount: mountCount.current,
            path: location.pathname + location.search
          });
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
      errorState: lastError.current ? 'error' : 'ok',
      avgTimeInTab: Math.round(tabMetrics.avgMountTime),
      hasEverMounted: tabMetrics.hasEverMounted
    },
    resetError
  };
}
