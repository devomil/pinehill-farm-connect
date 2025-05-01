
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
        // First, fetch all communications for the user
        const { data: allCommunications, error: commError } = await supabase
          .from('employee_communications')
          .select(`
            *
          `)
          .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
          .order('created_at', { ascending: false });

        if (commError) {
          console.error("Supabase communications query error:", commError);
          throw commError;
        }

        if (!allCommunications || allCommunications.length === 0) {
          console.log("No communications data returned");
          return [];
        }

        console.log(`Retrieved ${allCommunications.length} communications, now fetching shift requests`);

        // Now for each communication, fetch related shift coverage requests
        const communicationsWithRequests = await Promise.all(
          allCommunications.map(async (comm) => {
            // Only fetch shift coverage requests for shift_coverage type messages
            if (comm.type === 'shift_coverage') {
              console.log(`Fetching shift requests for communication: ${comm.id}`);
              const { data: shiftRequests, error: shiftError } = await supabase
                .from('shift_coverage_requests')
                .select('*')
                .eq('communication_id', comm.id);
                
              if (shiftError) {
                console.error(`Error fetching shift requests for comm ${comm.id}:`, shiftError);
                return { ...comm, shift_coverage_requests: [] };
              }
              
              if (shiftRequests && shiftRequests.length > 0) {
                console.log(`Found ${shiftRequests.length} shift coverage requests for comm ${comm.id}`);
                return { ...comm, shift_coverage_requests: shiftRequests };
              } else {
                console.log(`No shift requests found for communication ${comm.id}`);
              }
            }
            
            // For non-shift coverage messages or if no requests found
            return { ...comm, shift_coverage_requests: [] };
          })
        );
        
        console.log(`Retrieved ${communicationsWithRequests.length} total communications`);
        console.log(`Including ${communicationsWithRequests.filter(c => c.type === 'shift_coverage').length} shift coverage requests`);
        
        // Debug log shift coverage communications
        const shiftCoverageMessages = communicationsWithRequests.filter(
          c => c.type === 'shift_coverage' && c.shift_coverage_requests?.length > 0
        );
        
        if (shiftCoverageMessages.length > 0) {
          console.log("Sample shift coverage messages:", shiftCoverageMessages.slice(0, 2));
        } else {
          console.log("No shift coverage messages with requests found");
        }
        
        return communicationsWithRequests;
      } catch (err) {
        console.error("Error in communications query:", err);
        throw err;
      }
    },
    enabled: !!currentUser?.id,
    staleTime: 30000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
