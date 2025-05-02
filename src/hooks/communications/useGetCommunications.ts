
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";
import { useLocation } from "react-router-dom";

export function useGetCommunications(currentUser: User | null, excludeShiftCoverage = false) {
  const location = useLocation();
  const isTimeManagementPage = location.pathname === '/time';
  
  return useQuery({
    queryKey: ['communications', currentUser?.id, excludeShiftCoverage],
    queryFn: async () => {
      if (!currentUser?.id) {
        console.log("User not logged in, cannot fetch communications");
        throw new Error("User must be logged in");
      }
      
      console.log(`Fetching communications for user: ${currentUser.id}, email: ${currentUser.email}`);
      console.log(`Exclude shift coverage: ${excludeShiftCoverage}`);
      
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

        // If we're excluding shift coverage messages (for direct communications page)
        // filter them out immediately before further processing
        const filteredCommunications = excludeShiftCoverage 
          ? allCommunications.filter(comm => comm.type !== 'shift_coverage')
          : allCommunications;
        
        console.log(`Retrieved ${allCommunications.length} communications, filtered to ${filteredCommunications.length} after type filtering`);
        
        // Find all communication ids of type "shift_coverage" that we need to process
        const shiftCoverageIds = filteredCommunications
          .filter(comm => comm.type === 'shift_coverage')
          .map(comm => comm.id);
          
        console.log(`Found ${shiftCoverageIds.length} shift coverage communications to process`);
        
        // For admin users in time management page, we should show all shift coverage requests
        // so let's also fetch any shift coverage messages where they're not sender/recipient
        if (currentUser.role === 'admin' && !excludeShiftCoverage && isTimeManagementPage) {
          console.log("User is admin on time management page, fetching all shift coverage requests");
          
          // Only fetch if there are existing shift ids to avoid empty query issues
          if (shiftCoverageIds.length > 0) {
            const { data: adminCommunications, error: adminError } = await supabase
              .from('employee_communications')
              .select('*')
              .eq('type', 'shift_coverage')
              .not('id', 'in', `(${shiftCoverageIds.join(',')})`)
              .order('created_at', { ascending: false });
              
            if (adminError) {
              console.error("Error fetching admin shift communications:", adminError);
            } else if (adminCommunications && adminCommunications.length > 0) {
              console.log(`Found ${adminCommunications.length} additional shift coverage communications for admin`);
              filteredCommunications.push(...adminCommunications);
              
              // Update shift coverage IDs to include the new messages
              adminCommunications.forEach(comm => {
                shiftCoverageIds.push(comm.id);
              });
            }
          }
        }

        // If we have shift coverage communications, fetch all related requests at once
        let allShiftRequests = [];
        if (shiftCoverageIds.length > 0) {
          // Create a properly formatted IN clause
          const { data: shiftRequests, error: shiftError } = await supabase
            .from('shift_coverage_requests')
            .select('*')
            .in('communication_id', shiftCoverageIds);
            
          if (shiftError) {
            console.error("Error fetching shift requests:", shiftError);
          } else {
            allShiftRequests = shiftRequests || [];
            console.log(`Retrieved ${allShiftRequests.length} shift coverage requests`);
          }
        }

        // Now for each communication, attach the related shift coverage requests
        const communicationsWithRequests = filteredCommunications.map(comm => {
          if (comm.type === 'shift_coverage') {
            const requests = allShiftRequests.filter(req => req.communication_id === comm.id);
            return { ...comm, shift_coverage_requests: requests };
          }
          
          // For non-shift coverage messages
          return { ...comm, shift_coverage_requests: [] };
        });
        
        // Add current user ID to each communication for easier filtering
        const enhancedCommunications = communicationsWithRequests.map(comm => ({
          ...comm,
          current_user_id: currentUser.id
        }));
        
        // Sort communications by most recent first
        enhancedCommunications.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        return enhancedCommunications;
      } catch (err) {
        console.error("Error in communications query:", err);
        throw err;
      }
    },
    enabled: !!currentUser?.id,
    staleTime: 60000, // Increase stale time to reduce fetch frequency
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
