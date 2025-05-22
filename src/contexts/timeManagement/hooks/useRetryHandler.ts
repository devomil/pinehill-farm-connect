
import { useState, useCallback } from 'react';

export function useRetryHandler(showToast: (message: string, variant?: 'default' | 'destructive') => void) {
  const [retryCount, setRetryCount] = useState(0);
  const [lastRetryTime, setLastRetryTime] = useState(0);
  
  const handleRetry = useCallback(() => {
    const now = Date.now();
    const MIN_RETRY_INTERVAL = 5000; // 5 seconds between retries
    
    if (now - lastRetryTime < MIN_RETRY_INTERVAL) {
      showToast('Please wait before retrying again');
      return retryCount;
    }
    
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    setLastRetryTime(now);
    
    showToast('Retrying...');
    console.log(`Retry attempt #${newRetryCount}`);
    
    return newRetryCount;
  }, [retryCount, lastRetryTime, showToast]);
  
  return {
    retryCount,
    setRetryCount,
    handleRetry,
    lastRetryTime
  };
}
