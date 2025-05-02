
import { useMemo } from "react";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";

export function useShiftCoverageFilters(
  messages: Communication[],
  currentUser: User
) {
  // Filter to only shift coverage requests with improved logging
  const shiftCoverageRequests = useMemo(() => {
    if (!messages || messages.length === 0) {
      console.log("No messages found for shift coverage filtering");
      return [];
    }
    
    console.log(`Filtering ${messages.length} messages for shift coverage requests`);
    
    // Enhanced filtering to ensure we include all shift coverage requests
    const filtered = messages.filter(message => {
      // Must be shift_coverage type message
      if (message.type !== "shift_coverage") {
        return false;
      }
      
      // Must have shift request data
      const hasShiftRequests = message.shift_coverage_requests && 
                               message.shift_coverage_requests.length > 0;
      
      if (!hasShiftRequests) {
        console.log(`Message ${message.id} has no shift_coverage_requests data, skipping`);
        return false;
      }
      
      // For admin users, show all shift coverage messages
      if (currentUser.role === "admin") {
        return true;
      }
      
      // For non-admin users, only show messages relevant to them
      // This includes both requests they've sent and requests they've received
      const isRelevantToUser = message.sender_id === currentUser.id || 
                               message.recipient_id === currentUser.id ||
                               message.shift_coverage_requests.some(req => 
                                 req.original_employee_id === currentUser.id || 
                                 req.covering_employee_id === currentUser.id
                               );
      
      return isRelevantToUser;
    });
    
    console.log(`useShiftCoverageFilters - Found ${filtered.length} shift coverage requests out of ${messages.length} total messages`);
    
    if (filtered.length > 0) {
      console.log("Sample shift coverage request:", {
        id: filtered[0].id,
        sender: filtered[0].sender_id,
        recipient: filtered[0].recipient_id,
        status: filtered[0].shift_coverage_requests?.[0]?.status || 'unknown',
        shift_date: filtered[0].shift_coverage_requests?.[0]?.shift_date
      });
    } else {
      console.log("No shift coverage requests found after filtering");
    }
    
    return filtered;
  }, [messages, currentUser]);

  // Calculate counts for different status types
  const pendingCount = useMemo(() => 
    shiftCoverageRequests.filter(req => 
      req.shift_coverage_requests && 
      req.shift_coverage_requests.length > 0 && 
      req.shift_coverage_requests[0].status === 'pending'
    ).length, 
    [shiftCoverageRequests]
  );

  const acceptedCount = useMemo(() => 
    shiftCoverageRequests.filter(req => 
      req.shift_coverage_requests && 
      req.shift_coverage_requests.length > 0 && 
      req.shift_coverage_requests[0].status === 'accepted'
    ).length, 
    [shiftCoverageRequests]
  );

  const declinedCount = useMemo(() => 
    shiftCoverageRequests.filter(req => 
      req.shift_coverage_requests && 
      req.shift_coverage_requests.length > 0 && 
      req.shift_coverage_requests[0].status === 'declined'
    ).length, 
    [shiftCoverageRequests]
  );

  // Function to filter by status with improved handling
  const filterByStatus = (filter: 'all' | 'pending' | 'accepted' | 'declined', requests: Communication[]) => {
    console.log(`Filtering shift requests by status: ${filter}`);
    
    if (filter === 'all') {
      return requests;
    }
    
    const filtered = requests.filter(message => {
      if (!message.shift_coverage_requests || message.shift_coverage_requests.length === 0) {
        return false;
      }
      
      // Use the status from the shift_coverage_requests rather than message status
      const requestStatus = message.shift_coverage_requests[0].status;
      return requestStatus === filter;
    });
    
    console.log(`Status filter applied: ${filter}, found ${filtered.length} matching requests`);
    return filtered;
  };

  return {
    shiftCoverageRequests,
    pendingCount,
    acceptedCount,
    declinedCount,
    filterByStatus
  };
}
