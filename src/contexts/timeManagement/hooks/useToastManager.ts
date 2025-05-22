
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export function useToastManager() {
  // Track last toast time to prevent spam
  let lastToastTime = 0;
  
  const showThrottledToast = useCallback((message: string, variant: 'default' | 'destructive' = 'default') => {
    const now = Date.now();
    const TOAST_COOLDOWN = 5000; // 5 seconds between same toasts
    
    if (now - lastToastTime > TOAST_COOLDOWN) {
      toast({
        description: message,
        variant
      });
      lastToastTime = now;
    } else {
      console.log(`Toast throttled: ${message} (cooldown: ${Math.round((now - lastToastTime) / 1000)}s < ${TOAST_COOLDOWN / 1000}s)`);
    }
  }, []);

  return { showThrottledToast };
}
