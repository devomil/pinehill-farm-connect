
import { useState, useCallback } from 'react';

export const useErrorHandling = () => {
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = useCallback(() => {
    console.log("Retrying connection...");
    setRetryCount(prev => prev + 1);
    return retryCount + 1;
  }, [retryCount]);

  const isConnectionError = useCallback((error: any): boolean => {
    if (!error) return false;
    
    if (typeof error === 'string') {
      return error.includes("Failed to fetch");
    }
    
    if (error instanceof Error) {
      return error.message.includes("Failed to fetch");
    }
    
    return false;
  }, []);

  const formatErrorMessage = useCallback((error: any): string => {
    if (!error) return "Unknown error";
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return "Unknown error";
  }, []);

  return {
    retryCount,
    handleRetry,
    isConnectionError,
    formatErrorMessage
  };
};
