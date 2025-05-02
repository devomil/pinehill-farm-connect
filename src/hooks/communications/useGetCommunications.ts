
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
        
        // Find all communication ids of type "shift_coverage"
        const shiftCoverageIds = allCommunications
          .filter(comm => comm.type === 'shift_coverage')
          .map(comm => comm.id);
          
        console.log(`Found ${shiftCoverageIds.length} shift coverage communications`);

        // If we have shift coverage communications, fetch all related requests at once
        let allShiftRequests = [];
        if (shiftCoverageIds.length > 0) {
          const { data: shiftRequests, error: shiftError } = await supabase
            .from('shift_coverage_requests')
            .select('*')
            .in('communication_id', shiftCoverageIds);
            
          if (shiftError) {
            console.error("Error fetching shift requests:", shiftError);
          } else {
            allShiftRequests = shiftRequests || [];
            console.log(`Retrieved ${allShiftRequests.length} shift coverage requests`);
            
            if (allShiftRequests.length > 0) {
              console.log("Sample shift request:", allShiftRequests[0]);
            } else if (shiftCoverageIds.length > 0) {
              // This is unexpected - we have shift coverage messages but no requests
              console.warn("No shift requests found despite having shift coverage messages");
              
              // Let's check for any shift requests in the database
              const { data: anyShiftRequests } = await supabase
                .from('shift_coverage_requests')
                .select('*')
                .limit(5);
                
              console.log(`Total shift requests in database: ${anyShiftRequests?.length || 0}`);
              if (anyShiftRequests && anyShiftRequests.length > 0) {
                console.log("Sample shift request from database:", anyShiftRequests[0]);
              }
            }
          }
        }

        // Now for each communication, attach the related shift coverage requests
        const communicationsWithRequests = allCommunications.map(comm => {
          if (comm.type === 'shift_coverage') {
            const requests = allShiftRequests.filter(req => req.communication_id === comm.id);
            
            if (requests.length > 0) {
              console.log(`Communication ${comm.id} has ${requests.length} shift requests`);
            } else {
              console.log(`Communication ${comm.id} has no shift requests despite type being shift_coverage`);
            }
            
            return { ...comm, shift_coverage_requests: requests };
          }
          
          // For non-shift coverage messages
          return { ...comm, shift_coverage_requests: [] };
        });
        
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
