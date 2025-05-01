
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
            startDate: new Date(r.start_date),
            endDate: new Date(r.end_date),
            status: r.status,
            id: r.id,
            reason: r.reason || '', // Ensure reason is never undefined
            userId: r.user_id,
            notes: r.notes,
            profiles: r.profiles // Keep the profiles data for admins
          }))
        );
        
        // Only show success notification for manual refreshes, not initial load
        if (retryCount > 0) {
          toast.success("Time off requests refreshed successfully");
        }
      } else {
        console.log("No time off requests data returned");
        setTimeOffRequests([]);
      }
      
      setInitialFetchDone(true);
    } catch (err: any) {
      console.error("Failed to fetch time-off requests:", err);
      setError(err);
      // Only show error for manual retries, not initial load failures which we'll handle silently
      if (retryCount > 0) {
        toast.error("Failed to fetch time-off requests. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, retryCount]);

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
    (request) => request.userId === currentUser?.id
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
