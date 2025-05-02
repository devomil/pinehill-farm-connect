
import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TimeOffRequest } from '@/types/timeManagement';
import { User } from '@/types';
import { createThrottledToast, processTimeOffRequests } from './useTimeOffUtils';

/**
 * Hook to fetch and manage time off request data
 */
export function useTimeOffData(
  currentUser: User | null, 
  retryCount: number
) {
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const lastToastTimeRef = useRef(0);

  // Local throttled toast function
  const showThrottledToast = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      createThrottledToast(lastToastTimeRef)(message, type);
    }, 
    []
  );

  // Fetch profiles for a list of user IDs
  const fetchUserProfiles = useCallback(async (userIds: string[]) => {
    if (!userIds.length) return {};
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);
        
      if (error) throw error;
      
      // Create a mapping of user IDs to names
      const namesMap: Record<string, any> = {};
      data?.forEach(profile => {
        // Use name if available, otherwise fallback to email or unknown
        namesMap[profile.id] = {
          name: profile.name || profile.email?.split('@')[0] || 'Unknown Employee',
          email: profile.email
        };
      });
      
      return namesMap;
    } catch (err) {
      console.error("Error fetching user profiles:", err);
      return {};
    }
  }, []);

  // Main data fetch function
  const fetchRequests = useCallback(async () => {
    if (!currentUser) return;
    
    // Don't show loading state for subsequent refreshes if we already have data
    if (!initialFetchDone) {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      console.log("Fetching time off requests for user:", currentUser.id);
      
      let query;
      
      // For admins, we need to fetch all requests but without trying to join with profiles
      if (currentUser.role === 'admin') {
        console.log("Admin user, fetching all time off requests");
        query = supabase
          .from("time_off_requests")
          .select("*");
      } else {
        // For regular users, fetch only their own requests
        console.log("Regular user, fetching their own time off requests");
        query = supabase
          .from("time_off_requests")
          .select("*")
          .eq("user_id", currentUser.id);
      }
      
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
        
        // If admin, fetch user names separately for display purposes
        let userProfiles: Record<string, any> = {};
        
        if (currentUser.role === 'admin' && data.length > 0) {
          // Get unique user IDs from requests and ensure they are strings
          const userIdsSet = new Set<string>();
          
          // Explicitly add each user_id as a string to the Set
          data.forEach(request => {
            if (request.user_id) {
              userIdsSet.add(String(request.user_id));
            }
          });
          
          // Convert Set to Array
          const userIds = Array.from(userIdsSet);
          
          if (userIds.length > 0) {
            userProfiles = await fetchUserProfiles(userIds);
          }
        }
        
        // Transform the data to match our TimeOffRequest type
        setTimeOffRequests(processTimeOffRequests(data, userProfiles));
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
  }, [currentUser, retryCount, initialFetchDone, showThrottledToast, fetchUserProfiles]);

  // Initial data fetch
  useEffect(() => {
    if (currentUser && !initialFetchDone) {
      console.log("Initial fetch of time off requests triggered");
      fetchRequests();
    }
  }, [currentUser, fetchRequests, initialFetchDone]);

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
    fetchRequests,
    initialFetchDone
  };
}
