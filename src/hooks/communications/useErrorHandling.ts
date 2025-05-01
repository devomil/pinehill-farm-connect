
import { useState, useCallback } from 'react';

/**
 * Hook to handle common error scenarios in the communications system
 */
export function useErrorHandling() {
  const [retryCount, setRetryCount] = useState(0);

  // Function to determine if an error is related to connection issues
  const isConnectionError = useCallback((error: any) => {
    if (!error) return false;
    
    // Check error message for common connection-related strings
    const errorMessage = typeof error === 'string' 
      ? error.toLowerCase() 
      : error.message?.toLowerCase() || '';
    
    return (
      errorMessage.includes('network') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('offline') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('failed to fetch')
    );
  }, []);

  // Function to format error messages for display
  const formatErrorMessage = useCallback((error: any) => {
    if (!error) return 'Unknown error';
    
    if (typeof error === 'string') return error;
    
    return error.message || 'An unexpected error occurred';
  }, []);

  // Function to handle retry attempts
  const handleRetry = useCallback(() => {
    const nextCount = retryCount + 1;
    setRetryCount(nextCount);
    return nextCount;
  }, [retryCount]);

  // Function to reset retry counter
  const resetRetry = useCallback(() => {
    setRetryCount(0);
  }, []);

  return {
    retryCount,
    handleRetry,
    resetRetry,
    isConnectionError,
    formatErrorMessage
  };
}
