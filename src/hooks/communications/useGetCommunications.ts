
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
      
      console.log(`Fetching communications for user: ${currentUser.id}, email: ${currentUser.email}`);
      
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
          console.log(`No communications found for user ${currentUser.email}`);
          return [];
        }

        console.log(`Retrieved ${allCommunications.length} communications for ${currentUser.email}`);
        
        // Log the raw communications data to debug
        console.log("Communications raw data:", allCommunications.map(c => ({
          id: c.id,
          type: c.type,
          sender: c.sender_id,
          recipient: c.recipient_id,
          status: c.status
        })));

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
                console.log(`Shift request details:`, shiftRequests[0]);
                return { ...comm, shift_coverage_requests: shiftRequests };
              } else {
                console.log(`No shift requests found for communication ${comm.id} despite type being shift_coverage`);
                
                // Let's check if there are any shift requests in the database that might match this communication
                const { data: allShiftRequests, error: allShiftError } = await supabase
                  .from('shift_coverage_requests')
                  .select('*')
                  .limit(10);
                  
                if (allShiftError) {
                  console.error("Error checking all shift requests:", allShiftError);
                } else {
                  console.log(`Found ${allShiftRequests?.length || 0} total shift requests in database`);
                  if (allShiftRequests && allShiftRequests.length > 0) {
                    console.log("Sample shift request from database:", allShiftRequests[0]);
                  }
                }
              }
            }
            
            // For non-shift coverage messages or if no requests found
            return { ...comm, shift_coverage_requests: [] };
          })
        );
        
        // Count shift coverage messages with actual requests
        const shiftCoverageMessages = communicationsWithRequests.filter(
          c => c.type === 'shift_coverage' && c.shift_coverage_requests?.length > 0
        );
        
        console.log(`Retrieved ${communicationsWithRequests.length} total communications`);
        console.log(`Including ${shiftCoverageMessages.length} shift coverage requests with actual request data`);
        
        // Add current user ID to each communication for easier filtering
        const enhancedCommunications = communicationsWithRequests.map(comm => ({
          ...comm,
          current_user_id: currentUser.id
        }));
        
        return enhancedCommunications;
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
