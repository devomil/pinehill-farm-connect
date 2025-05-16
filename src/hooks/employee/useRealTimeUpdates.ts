
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to set up real-time updates for employee data with throttling
 */
export function useRealTimeUpdates(onDataChange: () => void) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastUpdateTime = useRef<number>(Date.now());
  const updateThrottleTimer = useRef<number | null>(null);
  const pendingUpdateCount = useRef<number>(0);
  const THROTTLE_TIME = 60000; // 1 minute throttle time

  // Memoize and throttle the callback to prevent excessive refreshes
  const throttledOnDataChange = useCallback(() => {
    // Track that we received an update
    pendingUpdateCount.current += 1;
    
    // Clear existing timer
    if (updateThrottleTimer.current !== null) {
      clearTimeout(updateThrottleTimer.current);
      updateThrottleTimer.current = null;
    }
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime.current;
    
    if (timeSinceLastUpdate < THROTTLE_TIME) {
      console.log(`Throttling profile update, last update was ${Math.round(timeSinceLastUpdate/1000)}s ago. ${pendingUpdateCount.current} pending.`);
      // Set timer for remaining throttle time
      updateThrottleTimer.current = window.setTimeout(() => {
        console.log(`Executing throttled profile update with ${pendingUpdateCount.current} batched changes`);
        lastUpdateTime.current = Date.now();
        pendingUpdateCount.current = 0;
        onDataChange();
      }, THROTTLE_TIME - timeSinceLastUpdate) as unknown as number;
    } else {
      // It's been long enough, update immediately
      console.log('Profile changes detected, refreshing employee directory');
      lastUpdateTime.current = now;
      pendingUpdateCount.current = 0;
      onDataChange();
    }
  }, [onDataChange]);

  useEffect(() => {
    console.log('Setting up real-time subscription for profiles table');
    
    // Clean up any existing channel
    if (channelRef.current) {
      console.log('Cleaning up existing channel before creating a new one');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    const channel = supabase
      .channel('employee-directory-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        throttledOnDataChange
      )
      .subscribe();
    
    channelRef.current = channel;

    return () => {
      console.log('Cleaning up real-time subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      // Also clear any pending timeout
      if (updateThrottleTimer.current !== null) {
        clearTimeout(updateThrottleTimer.current);
        updateThrottleTimer.current = null;
      }
    };
  }, [throttledOnDataChange]);

  return null;
}
