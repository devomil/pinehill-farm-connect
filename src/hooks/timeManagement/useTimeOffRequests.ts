import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TimeOffRequest } from '@/types/timeManagement';
import { toast } from 'sonner';
import { User } from '@/types';

export function useTimeOffRequests(currentUser: User | null, retryCount: number) {
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [requestsSubscribed, setRequestsSubscribed] = useState(false);
  const [lastToastTime, setLastToastTime] = useState(0);

  // Local throttled toast function to prevent hooks dependency issues
  const showThrottledToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const now = Date.now();
    // Only show a toast if it's been at least 5 seconds since the last one
    if (now - lastToastTime > 5000) {
      if (type === 'success') {
        toast.success(message);
      } else {
        toast.error(message);
      }
      setLastToastTime(now);
    }
  }, [lastToastTime]);

  const fetchRequests = useCallback(async () => {
    if (!currentUser) return;
    
    // Don't show loading state for subsequent refreshes if we already have data
    if (!initialFetchDone) {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      console.log("Fetching time off requests for user:", currentUser.id);
      
      // For admins, include profile data to display employee names
      const query = currentUser.role === 'admin' 
        ? supabase
            .from("time_off_requests")
            .select(`
              *,
              profiles:user_id (id, name, email)
            `)
        : supabase
            .from("time_off_requests")
            .select("*")
            .eq("user_id", currentUser.id);
        
      const { data, error: fetchError } = await query;
        
      if (fetchError) {
        console.error("Supabase error:", fetchError);
        throw fetchError;
      }
      
      if (data) {
        console.log(`Retrieved ${data.length} time off requests`);
        
        // Enhanced debug info
        if (data.length > 0) {
          console.log("Sample time off request:", data[0]);
        }
        
        setTimeOffRequests(
          data.map((r: any) => ({
            ...r,
            // Keep the original snake_case properties
            // Add camelCase aliases for compatibility
            startDate: new Date(r.start_date),
            endDate: new Date(r.end_date),
            userId: r.user_id,
            // Ensure reason is never undefined
            reason: r.reason || '',
            // Keep profiles data for admins
            profiles: r.profiles
          }))
        );
        
        // Only show success notification for manual refreshes, not initial load or automatic background refreshes
        // We now let the TimeManagementContext handle toast notifications
      } else {
        console.log("No time off requests data returned");
        setTimeOffRequests([]);
      }
      
      setInitialFetchDone(true);
    } catch (err: any) {
      console.error("Failed to fetch time-off requests:", err);
      setError(err);
      
      // Only show error for manual retries, not initial load failures
      if (retryCount > 0) {
        showThrottledToast("Failed to fetch time-off requests. Please try again.", 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, retryCount, initialFetchDone, showThrottledToast]);

  // Setup realtime subscription for time_off_requests table
  useEffect(() => {
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
        // Instead of doing a full refetch which can cause flashing,
        // we could update the local state based on the payload
        // For simplicity, we'll still call fetchRequests here
        fetchRequests();
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setRequestsSubscribed(true);
      });

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
      setRequestsSubscribed(false);
    };
  }, [currentUser, fetchRequests, requestsSubscribed]);

  // Initial data fetch
  useEffect(() => {
    if (currentUser) {
      console.log("Initial fetch of time off requests triggered");
      fetchRequests();
    }
  }, [currentUser, fetchRequests]);

  // Derived state
  const pendingRequests = timeOffRequests.filter(
    (request) => request.status === "pending"
  );
  
  const userRequests = timeOffRequests.filter(
    (request) => request.user_id === currentUser?.id
  );
  
  // Log derived states for debugging
  useEffect(() => {
    console.log("Pending requests count:", pendingRequests.length);
    console.log("User requests count:", userRequests.length);
  }, [pendingRequests.length, userRequests.length]);

  return {
    timeOffRequests,
    loading,
    error,
    pendingRequests,
    userRequests,
    fetchRequests
  };
}
