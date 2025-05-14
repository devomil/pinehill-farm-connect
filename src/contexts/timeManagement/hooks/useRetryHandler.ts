
import { useState, useCallback } from "react";

/**
 * Hook for handling retry operations
 */
export const useRetryHandler = (
  showToast: (message: string, type?: 'success' | 'info') => void
) => {
  const [retryCount, setRetryCount] = useState(0);
  
  const handleRetry = useCallback(() => {
    console.log("Manual retry triggered");
    setRetryCount(prevCount => prevCount + 1);
    showToast("Retrying data fetch...");
    return retryCount + 1;
  }, [retryCount, showToast]);
  
  return {
    retryCount,
    setRetryCount,
    handleRetry
  };
};
