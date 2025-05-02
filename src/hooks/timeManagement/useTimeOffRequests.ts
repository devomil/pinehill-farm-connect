
import { useCallback } from 'react';
import { User } from '@/types';
import { useTimeOffData } from './useTimeOffData';
import { useTimeOffRealtime } from './useTimeOffRealtime';

/**
 * Main hook that combines data fetching and realtime subscriptions
 * for time off requests
 */
export function useTimeOffRequests(currentUser: User | null, retryCount: number) {
  const {
    timeOffRequests,
    loading,
    error,
    pendingRequests,
    userRequests,
    fetchRequests,
    initialFetchDone
  } = useTimeOffData(currentUser, retryCount);
  
  // Memoize the refresh callback to prevent unnecessary resubscriptions
  const refreshCallback = useCallback(() => {
    fetchRequests();
  }, [fetchRequests]);
  
  // Set up realtime updates
  useTimeOffRealtime(currentUser, refreshCallback);
  
  return {
    timeOffRequests,
    loading,
    error,
    pendingRequests,
    userRequests,
    fetchRequests,
    initialFetchDone
  };
}
