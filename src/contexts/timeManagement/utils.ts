
import { toast } from "@/hooks/use-toast";

/**
 * Enhanced toast system with deduplication and throttling
 */
export const createThrottledToast = (
  pendingToasts: Set<string>,
  setLastToastTime: (time: number) => void,
  lastToastTime: number
) => {
  return (message: string, type: 'success' | 'info' = 'info') => {
    // Create a unique key for this message + type combo
    const toastKey = `${message}-${type}`;
    const now = Date.now();
    
    // Only show a toast if:
    // 1. It's been at least 20 seconds since the last toast
    // 2. This exact message isn't already pending/showing
    if (now - lastToastTime > 20000 && !pendingToasts.has(toastKey)) {
      // Add to pending toasts set to prevent duplicates
      pendingToasts.add(toastKey);
      
      // Show the toast with the appropriate type
      const variant = type === 'success' ? 'success' : 'default';
      
      toast({
        description: message,
        variant,
        onDismiss: () => {
          pendingToasts.delete(toastKey);
        }
      });
      
      // Update last toast time
      setLastToastTime(now);
      
      // Auto-clear from pending after 20 seconds
      setTimeout(() => {
        pendingToasts.delete(toastKey);
      }, 20000);
    } else {
      console.log(`Toast "${message}" suppressed - too soon or duplicate`);
    }
  };
};

/**
 * Checks if a refresh should be allowed based on timing and in-progress state
 */
export const shouldAllowRefresh = (
  refreshInProgress: boolean,
  lastRefreshTime: number,
  minTimeBetweenRefreshes: number = 15000
): boolean => {
  const now = Date.now();
  
  if (refreshInProgress || now - lastRefreshTime < minTimeBetweenRefreshes) {
    console.log("Refresh skipped - too soon or already in progress");
    return false;
  }
  
  return true;
};
