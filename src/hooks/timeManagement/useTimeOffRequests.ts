
import { useCallback, useEffect } from 'react';
import { User } from '@/types';
import { useTimeOffData } from './useTimeOffData';
import { useTimeOffRealtime } from './useTimeOffRealtime';
import { toast } from 'sonner';

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
  
  // Log when the hook is called
  useEffect(() => {
    console.log(`useTimeOffRequests: Initialized with user=${currentUser?.id}, retryCount=${retryCount}`);
    console.log(`useTimeOffRequests: Loading=${loading}, Error=${error ? 'Yes' : 'No'}, Initial fetch done=${initialFetchDone}`);
    console.log(`useTimeOffRequests: Found ${timeOffRequests?.length || 0} total requests, ${pendingRequests?.length || 0} pending, ${userRequests?.length || 0} for current user`);
  }, [currentUser, retryCount, loading, error, initialFetchDone, timeOffRequests, pendingRequests, userRequests]);
  
  // Force initial fetch if not done yet and we have a current user
  useEffect(() => {
    if (currentUser && !initialFetchDone && !loading) {
      console.log("Forcing initial time off requests fetch");
      fetchRequests();
    }
  }, [currentUser, initialFetchDone, loading, fetchRequests]);
  
  // Add an effect to retry fetching if there was an error
  useEffect(() => {
    if (error && currentUser && !loading) {
      console.log("Detected error in time off requests, will retry in 2 seconds");
      const timer = setTimeout(() => {
        console.log("Retrying time off requests fetch after error");
        fetchRequests();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [error, currentUser, loading, fetchRequests]);
  
  // Memoize the refresh callback to prevent unnecessary resubscriptions
  const refreshCallback = useCallback(() => {
    console.log("Real-time update triggered refresh of time off requests");
    fetchRequests();
    toast.info("Time off requests updated");
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
