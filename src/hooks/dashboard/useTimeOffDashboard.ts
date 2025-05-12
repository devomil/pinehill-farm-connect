
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TimeOffRequest } from "@/types/timeManagement";

/**
 * Hook for fetching time off data for the dashboard
 */
export function useTimeOffDashboard(
  currentUser: any | null, 
  retryCount: number, 
  isAdmin: boolean
) {
  // Fetch pending time off requests (for admin)
  const { data: pendingTimeOff, error: pendingTimeOffError, refetch: refetchPendingTimeOff } = useQuery({
    queryKey: ['pendingTimeOff', retryCount],
    queryFn: async () => {
      if (!isAdmin) return [];
      
      console.log("Fetching pending time off requests for admin");
      
      // Modified query to avoid the join that was causing errors
      const { data, error } = await supabase
        .from('time_off_requests')
        .select('*')
        .eq('status', 'pending');
      
      if (error) {
        console.error("Error fetching pending time off:", error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} pending time off requests`);
      
      // If we have data, fetch the profiles separately for each user_id
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(req => req.user_id))];
        
        // Fetch profiles for these users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds);
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          // Continue with the data we have
        }
        
        // Create a map of user_id to profile data
        const profileMap = {};
        if (profiles) {
          profiles.forEach(profile => {
            profileMap[profile.id] = profile;
          });
        }
        
        // Attach profile data to each request
        return data.map(r => ({
          ...r,
          startDate: new Date(r.start_date),
          endDate: new Date(r.end_date),
          userId: r.user_id,
          profiles: profileMap[r.user_id] || null
        })) as unknown as TimeOffRequest[];
      }
      
      // Transform the data to match our TimeOffRequest type with both snake_case and camelCase
      return data ? data.map((r: any) => ({
        ...r,  // Keep original fields
        startDate: new Date(r.start_date),
        endDate: new Date(r.end_date),
        userId: r.user_id
      })) as unknown as TimeOffRequest[] : [];
    },
    enabled: Boolean(currentUser?.id) && isAdmin,
    staleTime: 30000, // Add stale time to reduce unnecessary refetches
    retry: 3,
    // Add safety to prevent the error
    meta: {
      onError: (error: any) => {
        console.error("Error in pendingTimeOff query:", error);
      }
    }
  });

  // Fetch user's own time off requests
  const { data: userTimeOff, error: userTimeOffError, refetch: refetchUserTimeOff } = useQuery({
    queryKey: ['userTimeOff', currentUser?.id, retryCount],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      
      console.log(`Fetching time off requests for user ${currentUser.id}`);
      
      const { data, error } = await supabase
        .from('time_off_requests')
        .select('*')
        .eq('user_id', currentUser.id);
      
      if (error) {
        console.error("Error fetching user time off:", error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} time off requests for user`);
      
      // Transform the data to match our TimeOffRequest type
      return data ? data.map((r: any) => ({
        ...r,  // Keep original fields
        startDate: new Date(r.start_date),
        endDate: new Date(r.end_date),
        userId: r.user_id
      })) as unknown as TimeOffRequest[] : [];
    },
    enabled: Boolean(currentUser?.id),
    staleTime: 30000,
    retry: 3,
    // Add safety to prevent the error
    meta: {
      onError: (error: any) => {
        console.error("Error in userTimeOff query:", error);
      }
    }
  });

  const error = pendingTimeOffError || userTimeOffError;
  const loading = (!pendingTimeOff && isAdmin && Boolean(currentUser?.id)) || 
                  (!userTimeOff && Boolean(currentUser?.id));

  return {
    pendingTimeOff: pendingTimeOff || [],
    userTimeOff: userTimeOff || [],
    error,
    loading,
    refetchPendingTimeOff,
    refetchUserTimeOff
  };
}
