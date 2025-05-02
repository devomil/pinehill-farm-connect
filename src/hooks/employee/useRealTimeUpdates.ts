
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to set up real-time updates for employee data
 */
export function useRealTimeUpdates(onDataChange: () => void) {
  useEffect(() => {
    console.log('Setting up real-time subscription for profiles table');
    
    const channel = supabase
      .channel('employee-directory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        console.log('Profile changes detected, refreshing employee directory');
        onDataChange();
      })
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [onDataChange]);

  return null;
}
