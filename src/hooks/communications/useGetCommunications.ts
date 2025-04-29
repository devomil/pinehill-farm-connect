
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";

export function useGetCommunications(currentUser: User | null) {
  return useQuery({
    queryKey: ['communications', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) {
        console.log("User not logged in, cannot fetch communications");
        throw new Error("User must be logged in");
      }
      
      console.log(`Fetching communications for user: ${currentUser.id}`);
      
      try {
        const { data, error } = await supabase
          .from('employee_communications')
          .select(`
            *,
            shift_coverage_requests(*)
          `)
          .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }
        
        if (!data) {
          console.log("No communications data returned");
          return [];
        }
        
        console.log(`Retrieved ${data.length} communications`);
        return data;
      } catch (err) {
        console.error("Error in communications query:", err);
        throw err;
      }
    },
    enabled: !!currentUser?.id,
    // Add retry configuration
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Increase stale time to reduce unnecessary refetches
    staleTime: 30000,
  });
}
