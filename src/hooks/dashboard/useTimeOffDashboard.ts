
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
      
      // Join with profiles to get employee names
      const { data, error } = await supabase
        .from('time_off_requests')
        .select(`
          *,
          profiles:user_id (name, email)
        `)
        .eq('status', 'pending');
      
      if (error) {
        console.error("Error fetching pending time off:", error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} pending time off requests`);
      
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
