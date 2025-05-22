import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useDebug } from '@/hooks/useDebug';
import { toast } from 'sonner';

export function RouteDebugger() {
  const location = useLocation();
  const navigate = useNavigate();
  const debug = useDebug('RouteDebugger', { traceLifecycle: true });
  const prevLocationRef = useRef(location);
  const navigationCountRef = useRef(0);
  const navigationTimesRef = useRef<number[]>([]);
  const [isLoopDetected, setIsLoopDetected] = useState(false);
  
  // Enhanced navigation tracking with timestamps and rate detection
  useEffect(() => {
    const prevPath = prevLocationRef.current.pathname + prevLocationRef.current.search;
    const currentPath = location.pathname + location.search;
    
    if (prevPath !== currentPath) {
      navigationCountRef.current += 1;
      const now = Date.now();
      navigationTimesRef.current.push(now);
      
      // Only keep timestamps from the last 5 seconds
      navigationTimesRef.current = navigationTimesRef.current.filter(
        time => now - time < 5000
      );
      
      debug.log('Navigation detected', {
        from: prevPath,
        to: currentPath,
        navigationCount: navigationCountRef.current,
        recentNavigations: navigationTimesRef.current.length
      });
      
      // Detect potential navigation loops - 5+ navigations in 5 seconds is suspicious
      if (navigationTimesRef.current.length >= 5) {
        debug.warn('Potential navigation loop detected', {
          navigationCount: navigationCountRef.current,
          path: currentPath,
          recentNavigations: navigationTimesRef.current.length,
          timeWindow: '5 seconds'
        });
        
        setIsLoopDetected(true);
        
        // Emergency loop breaker - if we detect over 10 navigations in 5 seconds, force a reset
        if (navigationTimesRef.current.length > 10 && !window.sessionStorage.getItem('loop_broken')) {
          // Set a flag to prevent multiple interventions
          window.sessionStorage.setItem('loop_broken', 'true');
          
          // Force navigation to a stable route with refreshed state
          debug.error('Emergency navigation loop breaker activated');
          toast.error('Navigation loop detected - emergency reset initiated');
          
          // Reset to dashboard as a safety measure
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 100);
          
          // Clear the flag after things stabilize
          setTimeout(() => {
            window.sessionStorage.removeItem('loop_broken');
          }, 10000);
        }
      } else {
        setIsLoopDetected(false);
      }
      
      prevLocationRef.current = location;
    }
  }, [location, debug, navigate]);
  
  // Only show alert when navigation loops are detected
  if (!isLoopDetected) {
    return null;
  }
  
  return (
    <Alert variant="destructive" className="my-2">
      <AlertTitle>Potential Navigation Loop Detected</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          The application has navigated rapidly in succession, 
          which may indicate a navigation loop.
        </p>
        
        <div className="flex gap-2 mt-2">
          <Button 
            size="sm"
            variant="outline"
            onClick={() => {
              navigationCountRef.current = 0;
              navigationTimesRef.current = [];
              setIsLoopDetected(false);
              
              const baseRoute = location.pathname.split('?')[0];
              navigate(baseRoute, { replace: true });
              
              debug.log('Navigation reset requested', { timestamp: new Date().toISOString() });
              toast.success('Navigation reset successful');
            }}
          >
            Reset Navigation
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
