
import { useCallback, useRef, useState } from "react";
import { createThrottledToast } from "../utils";

/**
 * Hook for managing toast notifications with throttling and deduplication
 */
export const useToastManager = () => {
  const [lastToastTime, setLastToastTime] = useState(0);
  const pendingToasts = useRef<Set<string>>(new Set());
  
  // Create toast with throttling
  const showThrottledToast = useCallback((message: string, type: 'success' | 'info' = 'info') => {
    return createThrottledToast(
      pendingToasts.current, 
      setLastToastTime,
      lastToastTime
    )(message, type);
  }, [lastToastTime]);
  
  return {
    showThrottledToast,
    lastToastTime,
    pendingToasts
  };
};
