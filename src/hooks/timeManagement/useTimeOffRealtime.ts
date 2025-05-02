
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

/**
 * Hook to manage realtime subscriptions for time-off requests
 */
export function useTimeOffRealtime(
  currentUser: User | null,
  onUpdate: () => void
) {
  const [requestsSubscribed, setRequestsSubscribed] = useState(false);
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Setup realtime subscription for time_off_requests table
  useEffect(() => {
    // Clear previous subscription if it exists to prevent duplicates
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
      setRequestsSubscribed(false);
    }
    
    if (!currentUser || requestsSubscribed) return;
    
    console.log("Setting up realtime subscription for time_off_requests");
    
    // Set up subscription for real-time updates
    const channel = supabase
      .channel('time-off-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'time_off_requests' 
      }, (payload) => {
        console.log('Received time-off request update via realtime:', payload);
        onUpdate();
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setRequestsSubscribed(true);
      });
    
    // Store the channel reference for cleanup
    subscriptionRef.current = channel;

    // Clean up subscription on unmount
    return () => {
      console.log("Cleaning up realtime subscription");
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      setRequestsSubscribed(false);
    };
  }, [currentUser, onUpdate, requestsSubscribed]);

  return { requestsSubscribed };
}

import { useState } from 'react'; // Add missing import
