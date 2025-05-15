
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useDebug } from '@/hooks/useDebug';

export function RouteDebugger() {
  const location = useLocation();
  const navigate = useNavigate();
  const debug = useDebug('RouteDebugger', { traceLifecycle: true });
  const prevLocationRef = useRef(location);
  const navigationCountRef = useRef(0);
  
  // Track navigation changes
  useEffect(() => {
    const prevPath = prevLocationRef.current.pathname + prevLocationRef.current.search;
    const currentPath = location.pathname + location.search;
    
    if (prevPath !== currentPath) {
      navigationCountRef.current += 1;
      
      debug.log('Navigation detected', {
        from: prevPath,
        to: currentPath,
        navigationCount: navigationCountRef.current
      });
      
      // Detect potential navigation loops
      if (navigationCountRef.current > 5 && currentPath.includes('/communication')) {
        debug.warn('Potential navigation loop detected in communications', {
          navigationCount: navigationCountRef.current,
          path: currentPath
        });
      }
      
      prevLocationRef.current = location;
    }
  }, [location, debug]);
  
  // Only show alert when navigation loops are detected
  if (navigationCountRef.current <= 5) {
    return null;
  }
  
  return (
    <Alert variant="destructive" className="my-2">
      <AlertTitle>Potential Navigation Loop Detected</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          The application has navigated {navigationCountRef.current} times in rapid succession, 
          which may indicate a navigation loop.
        </p>
        
        <div className="flex gap-2 mt-2">
          <Button 
            size="sm"
            variant="outline"
            onClick={() => {
              navigationCountRef.current = 0;
              const baseRoute = location.pathname.split('?')[0];
              navigate(baseRoute, { replace: true });
              debug.log('Navigation reset requested', { timestamp: new Date().toISOString() });
            }}
          >
            Reset Navigation
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
