
import { useEffect, useRef } from 'react';
import { createDebugContext, trackRender, DebugLevel } from '@/utils/debugUtils';

interface UseDebugOptions {
  trackRenders?: boolean;
  level?: DebugLevel;
  logProps?: boolean;
  logStateChanges?: boolean;
  traceLifecycle?: boolean;
}

/**
 * Hook for component-level debugging
 * @param componentName The name of the component
 * @param options Debug options
 * @returns Debug context object
 */
export function useDebug(componentName: string, options: UseDebugOptions = {}) {
  const {
    trackRenders = true,
    level,
    logProps = false,
    logStateChanges = false,
    traceLifecycle = false
  } = options;

  const debugContext = createDebugContext(componentName);
  const renderCount = useRef<number>(0);
  const propsRef = useRef<any>(null);
  
  // Set custom debug level if provided
  useEffect(() => {
    if (level !== undefined) {
      debugContext.setDebugLevel(level);
    }
  }, [level]);

  // Track component mount/unmount
  useEffect(() => {
    if (traceLifecycle) {
      debugContext.debug('Component mounted');
      
      return () => {
        debugContext.debug('Component unmounted');
      };
    }
  }, [traceLifecycle]);
  
  // Track render count
  if (trackRenders) {
    renderCount.current = trackRender(componentName);
  }

  // Return debug utilities bound to this component
  return {
    ...debugContext,
    renderCount: renderCount.current,
    
    // Log changes to props or state
    logChanges: (name: string, oldValue: any, newValue: any) => {
      if (logStateChanges) {
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          debugContext.debug(`${name} changed:`, { 
            old: oldValue, 
            new: newValue,
            diff: getDiff(oldValue, newValue)
          });
        }
      }
    },
    
    // Track props changes
    trackProps: (props: any) => {
      if (logProps && propsRef.current) {
        const prevProps = propsRef.current;
        const changedProps: Record<string, {previous: any, current: any}> = {};
        
        Object.keys({ ...prevProps, ...props }).forEach(key => {
          if (prevProps[key] !== props[key]) {
            changedProps[key] = {
              previous: prevProps[key],
              current: props[key]
            };
          }
        });
        
        if (Object.keys(changedProps).length > 0) {
          debugContext.debug('Props changed:', changedProps);
        }
      }
      
      propsRef.current = { ...props };
    }
  };
}

// Helper function to compute a simple diff between objects
function getDiff(objA: any, objB: any): any {
  if (typeof objA !== 'object' || typeof objB !== 'object' || !objA || !objB) {
    return { from: objA, to: objB };
  }
  
  const diff: Record<string, any> = {};
  
  // Check keys in objA
  Object.keys(objA).forEach(key => {
    // If key doesn't exist in objB or values are different
    if (!(key in objB) || objA[key] !== objB[key]) {
      diff[key] = { from: objA[key], to: key in objB ? objB[key] : '<<REMOVED>>' };
    }
  });
  
  // Check for new keys in objB
  Object.keys(objB).forEach(key => {
    if (!(key in objA) && !(key in diff)) {
      diff[key] = { from: '<<ADDED>>', to: objB[key] };
    }
  });
  
  return diff;
}
