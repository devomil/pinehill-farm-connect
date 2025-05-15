
import { useEffect, useRef } from 'react';
import { useDebugContext } from '@/contexts/DebugContext';
import { createDebugContext } from '@/utils/debugUtils';

interface UseDebugOptions {
  trackRenders?: boolean;
  logStateChanges?: boolean;
  traceLifecycle?: boolean;
  initialData?: Record<string, any>;
}

/**
 * Custom hook for component debugging
 * 
 * @param componentName The name of the component being debugged
 * @param options Debugging options
 * @returns Debug utilities and component information
 */
export function useDebug(componentName: string, options: UseDebugOptions = {}) {
  const {
    trackRenders = false,
    logStateChanges = false,
    traceLifecycle = false,
    initialData = {}
  } = options;

  const { debugMode, debugComponents, debugLog } = useDebugContext();
  const shouldDebug = debugMode && (debugComponents[componentName] || debugComponents['*']);
  const renderCount = useRef(0);
  const debugContext = createDebugContext(componentName);
  const prevPropsRef = useRef<Record<string, any>>(initialData);

  // Track component renders
  useEffect(() => {
    if (!shouldDebug || !trackRenders) return;
    
    renderCount.current += 1;
    debugLog(componentName, `Component rendered ${renderCount.current} times`, { renderCount: renderCount.current });
    
    // Return cleanup
    return () => {
      if (traceLifecycle) {
        debugLog(componentName, 'Component unmounted', { renderCount: renderCount.current });
      }
    };
  }, [shouldDebug, trackRenders, componentName, debugLog, traceLifecycle]);

  // Log component mount
  useEffect(() => {
    if (!shouldDebug || !traceLifecycle) return;
    
    debugLog(componentName, 'Component mounted', { timestamp: new Date().toISOString() });
    
    return () => {
      debugLog(componentName, 'Component will unmount', { timestamp: new Date().toISOString() });
    };
  }, [shouldDebug, traceLifecycle, componentName, debugLog]);

  /**
   * Track state changes in the component
   * @param newState The new state object 
   * @param stateName Optional name for the state being tracked
   */
  const trackStateChange = (newState: any, stateName = 'state') => {
    if (!shouldDebug || !logStateChanges) return;
    
    const prevState = prevPropsRef.current[stateName];
    debugLog(componentName, `${stateName} changed`, { 
      previous: prevState,
      current: newState,
      diff: JSON.stringify(prevState) !== JSON.stringify(newState)
    });
    
    // Update the ref with new state
    prevPropsRef.current = {
      ...prevPropsRef.current,
      [stateName]: newState
    };
  };

  return {
    enabled: shouldDebug,
    renderCount: renderCount.current,
    trackStateChange,
    log: (message: string, data?: any) => {
      if (shouldDebug) {
        debugLog(componentName, message, data);
      }
    },
    ...debugContext // Include all the debug utilities from debugUtils
  };
}
