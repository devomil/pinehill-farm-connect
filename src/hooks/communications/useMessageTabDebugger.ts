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
  const initialMountCompleted = useRef(false);
  const lastQueryParams = useRef<URLSearchParams | null>(null);
  const mountTime = useRef<number>(Date.now());
  const lastError = useRef<Error | null>(null);
  const lastDirectoryRefresh = useRef<number | null>(null);
  const [tabMetrics, setTabMetrics] = useState({
    avgMountTime: 0,
    hasEverMounted: false,
  });
  
  // Track if we've seen too many mounts in a short period
  const recentMounts = useRef<number[]>([]);
  const MAX_MOUNTS_BEFORE_WARNING = 5;
  const MOUNT_WINDOW_MS = 5000; // 5 seconds
  
  // Reset error state
  const resetError = useCallback(() => {
    if (lastError.current) {
      debug.info("Clearing previous navigation error");
      lastError.current = null;
    }
  }, [debug]);
  
  // Monitor mount/unmount cycles to detect instability
  useEffect(() => {
    // Skip monitoring if not active
    if (!isActive) return;
    
    try {
      // Track recent mounts for better loop detection
      const now = Date.now();
      recentMounts.current.push(now);
      
      // Keep only mounts within our detection window
      recentMounts.current = recentMounts.current.filter(
        time => now - time < MOUNT_WINDOW_MS
      );
      
      // Check if we're mounting too frequently
      if (recentMounts.current.length >= MAX_MOUNTS_BEFORE_WARNING) {
        debug.warn(`MessageTab remounted ${recentMounts.current.length} times in ${MOUNT_WINDOW_MS/1000}s - possible navigation loop`);
        
        // Attempt to break potential loop by adding recovery flag to sessionStorage
        if (recentMounts.current.length >= MAX_MOUNTS_BEFORE_WARNING + 2) {
          if (!window.sessionStorage.getItem('message_tab_recovery_needed')) {
            window.sessionStorage.setItem('message_tab_recovery_needed', 'true');
            toast.error("Navigation issue detected", { 
              id: "navigation-loop-error",
              description: "Try using the recovery button to resolve this"
            });
          }
        }
      }
      
      // Only count mounts after initial render has settled
      if (initialMountCompleted.current) {
        mountCount.current += 1;
      } else {
        initialMountCompleted.current = true;
        console.log("Initial mount of message tab completed");
      }
      
      mountTime.current = now;
      
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
      
      // Track directory refresh time
      if (mountCount.current === 1 || mountCount.current % 10 === 0) {
        lastDirectoryRefresh.current = Date.now();
      }
      
      // Clear recovery flag if in recovery mode and mount is stable
      if (isRecoveryMode && mountCount.current === 1) {
        setTimeout(() => {
          window.sessionStorage.removeItem('message_tab_recovery_needed');
          debug.info("Cleared recovery flag after successful recovery");
        }, 3000);
      }
    } catch (error) {
      // Capture any errors during the mount effect
      console.error("Error in message tab debugger:", error);
      lastError.current = error instanceof Error ? error : new Error(String(error));
    }
    
    return () => {
      // Only track unmounts if we're monitoring the active tab
      if (!isActive) return;
      
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
        if (duration < 300 && mountCount.current > 3) {
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
      lastDirectoryRefresh: lastDirectoryRefresh.current,
      avgTimeInTab: Math.round(tabMetrics.avgMountTime),
      hasEverMounted: tabMetrics.hasEverMounted,
      recentMountCount: recentMounts.current.length
    },
    resetError,
    isLoopDetected: recentMounts.current.length >= MAX_MOUNTS_BEFORE_WARNING
  };
}
