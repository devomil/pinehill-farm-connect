
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export const useErrorHandling = () => {
  const [retryCount, setRetryCount] = useState(0);
  const [lastRetryTime, setLastRetryTime] = useState(0);

  // Auto-reset retry count after 5 minutes of no retries
  useEffect(() => {
    if (retryCount > 0) {
      const resetTimer = setTimeout(() => {
        if (Date.now() - lastRetryTime > 300000) { // 5 minutes
          setRetryCount(0);
        }
      }, 300000);
      
      return () => clearTimeout(resetTimer);
    }
  }, [retryCount, lastRetryTime]);

  const handleRetry = useCallback(() => {
    console.log("Retrying connection...");
    setRetryCount(prev => prev + 1);
    setLastRetryTime(Date.now());
    
    // Show toast for user feedback
    toast.info(`Retrying connection (attempt ${retryCount + 1})...`);
    
    return retryCount + 1;
  }, [retryCount]);

  const isConnectionError = useCallback((error: any): boolean => {
    if (!error) return false;
    
    // Check for string error
    if (typeof error === 'string') {
      return error.includes("Failed to fetch") || 
             error.includes("Network") || 
             error.includes("connection") ||
             error.includes("timeout");
    }
    
    // Check for Error object
    if (error instanceof Error) {
      return error.message.includes("Failed to fetch") || 
             error.message.includes("Network") || 
             error.message.includes("connection") ||
             error.message.includes("timeout") ||
             error.name === 'AbortError' ||
             error.name === 'TimeoutError';
    }
    
    // Check for Supabase error object
    if (error && typeof error === 'object' && 'message' in error) {
      const message = String(error.message);
      return message.includes("Failed to fetch") || 
             message.includes("Network") || 
             message.includes("connection") ||
             message.includes("timeout");
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
    
    if (error && typeof error === 'object') {
      if ('message' in error) return String(error.message);
      if ('error' in error) return String(error.error);
      if ('details' in error) return String(error.details);
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
