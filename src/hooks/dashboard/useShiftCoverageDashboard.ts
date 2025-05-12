
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProcessMessages } from "@/hooks/communications/useProcessMessages";
import { Communication } from "@/types/communications/communicationTypes";

/**
 * Hook for fetching shift coverage data for the dashboard
 */
export function useShiftCoverageDashboard(
  currentUser: any | null,
  retryCount: number,
  isAdmin: boolean
) {
  // Fetch shift coverage requests with improved query and error handling
  const { data: shiftCoverageMessagesRaw, error: shiftCoverageError, refetch: refetchShiftCoverage } = useQuery({
    queryKey: ['shiftCoverage', currentUser?.id, retryCount],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      
      console.log(`Fetching shift coverage data for ${currentUser?.name} (${currentUser?.id}), role: ${currentUser?.role}`);
      
      try {
        let messageQuery;
        
        // For admin users, fetch ALL shift coverage messages
        if (isAdmin) {
          console.log("Admin user - fetching ALL shift coverage messages");
          messageQuery = supabase
            .from('employee_communications')
            .select('*')
            .eq('type', 'shift_coverage');
        } else {
          // For regular users, fetch only messages where they're the sender or recipient
          console.log("Regular user - fetching only relevant shift coverage messages");
          messageQuery = supabase
            .from('employee_communications')
            .select('*')
            .eq('type', 'shift_coverage')
            .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`);
        }
        
        const { data: messages, error: messagesError } = await messageQuery;
        
        if (messagesError) {
          console.error("Error fetching shift coverage messages:", messagesError);
          throw messagesError;
        }
        
        console.log(`Found ${messages?.length || 0} shift coverage messages`);
        
        // If we have messages, fetch all related shift coverage requests in one batch
        if (messages && messages.length > 0) {
          const messageIds = messages.map(msg => msg.id);
          
          const { data: allShiftRequests, error: shiftRequestsError } = await supabase
            .from('shift_coverage_requests')
            .select('*')
            .in('communication_id', messageIds);
          
          if (shiftRequestsError) {
            console.error("Error fetching shift requests:", shiftRequestsError);
            throw shiftRequestsError;
          }
          
          console.log(`Found ${allShiftRequests?.length || 0} shift coverage requests`);
          
          // Create a map of communication_id to shift requests for efficient lookup
          const requestsByCommId = {};
          if (allShiftRequests) {
            allShiftRequests.forEach(req => {
              if (!requestsByCommId[req.communication_id]) {
                requestsByCommId[req.communication_id] = [];
              }
              requestsByCommId[req.communication_id].push(req);
            });
          }
          
          // Attach shift coverage requests to each message
          const messagesWithRequests = messages.map(msg => {
            const shiftRequests = requestsByCommId[msg.id] || [];
            
            // Add debug info for each message
            if (shiftRequests.length > 0) {
              console.log(`Message ${msg.id} has ${shiftRequests.length} shift requests`);
              const sampleRequest = shiftRequests[0];
              console.log(`Status: ${sampleRequest.status}, From: ${sampleRequest.original_employee_id}, To: ${sampleRequest.covering_employee_id}`);
            } else {
              console.log(`Message ${msg.id} has no shift requests despite being a shift_coverage type`);
            }
            
            return { ...msg, shift_coverage_requests: shiftRequests };
          });
          
          // Filter to only include messages with actual shift coverage requests
          const validMessages = messagesWithRequests.filter(msg => 
            msg.shift_coverage_requests && msg.shift_coverage_requests.length > 0
          );
          
          console.log(`After filtering for valid shift requests: ${validMessages.length} messages remain`);
          return validMessages;
        }
        
        console.log("No shift coverage messages found");
        return [];
      } catch (err) {
        console.error("Error in shift coverage data query:", err);
        throw err;
      }
    },
    enabled: !!currentUser?.id,
    staleTime: 15000, // Shorter stale time to ensure more frequent refreshes
    retry: 3
  });

  // Process the raw messages into properly typed Communication objects
  const shiftCoverageMessages = useProcessMessages(shiftCoverageMessagesRaw, currentUser);

  return {
    shiftCoverageMessages,
    shiftCoverageError,
    refetchShiftCoverage,
    loading: !shiftCoverageMessages && !!currentUser?.id
  };
}
