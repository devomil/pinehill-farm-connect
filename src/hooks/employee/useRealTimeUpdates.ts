
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to set up real-time updates for employee data
 */
export function useRealTimeUpdates(onDataChange: () => void) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    console.log('Setting up real-time subscription for profiles table');
    
    // Clean up any existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    
    const channel = supabase
      .channel('employee-directory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        console.log('Profile changes detected, refreshing employee directory');
        onDataChange();
      })
      .subscribe();
    
    channelRef.current = channel;

    return () => {
      console.log('Cleaning up real-time subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [onDataChange]);

  return null;
}
