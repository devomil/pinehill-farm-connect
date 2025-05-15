
import { useEffect, useRef } from 'react';
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
  
  // Monitor mount/unmount cycles to detect instability
  useEffect(() => {
    if (!isActive) return;
    
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
      }
    }
    
    // Store current params for next comparison
    lastQueryParams.current = urlParams;
    
    // Show toast if there have been excessive mounts in short succession
    if (mountCount.current > 2) {
      toast.warning(`Messages tab remounted ${mountCount.current} times, potential navigation loop`, {
        id: 'message-tab-debug'
      });
    }
    
    return () => {
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
    };
  }, [isActive, location, debug]);
  
  return {
    mountCount: mountCount.current,
    debugInfo: {
      currentUrl: location.pathname + location.search,
      tabParam: new URLSearchParams(location.search).get('tab'),
      mountedAt: mountTime.current
    }
  };
}
