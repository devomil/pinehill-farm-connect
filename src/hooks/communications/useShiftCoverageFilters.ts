
import { useMemo } from "react";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";

export function useShiftCoverageFilters(
  messages: Communication[],
  currentUser: User
) {
  // Filter to only shift coverage requests
  const shiftCoverageRequests = useMemo(() => {
    if (!messages || messages.length === 0) {
      console.log("No messages found for shift coverage filtering");
      return [];
    }
    
    // Filter to ensure we include all shift coverage requests
    const filtered = messages.filter(message => {
      // Must be shift_coverage type message
      if (message.type !== "shift_coverage") {
        return false;
      }
      
      // Must be relevant to current user (either sender or recipient)
      const isRelevantToUser = message.sender_id === currentUser.id || message.recipient_id === currentUser.id;
      
      // Must contain at least one shift request
      const hasShiftRequests = message.shift_coverage_requests && message.shift_coverage_requests.length > 0;
      
      if (isRelevantToUser && hasShiftRequests) {
        console.log(`Including shift coverage message ${message.id} in filtered results`);
        return true;
      }
      
      return false;
    });
    
    console.log(`useShiftCoverageFilters - Filtered ${filtered.length} shift coverage requests out of ${messages.length} messages`);
    return filtered;
  }, [messages, currentUser.id]);

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

  // Function to filter by status
  const filterByStatus = (filter: 'all' | 'pending' | 'accepted' | 'declined', requests: Communication[]) => {
    if (filter === 'all') {
      return requests;
    }
    
    return requests.filter(message => {
      if (!message.shift_coverage_requests || message.shift_coverage_requests.length === 0) {
        return false;
      }
      
      // Use the status from the shift_coverage_requests rather than message status
      const requestStatus = message.shift_coverage_requests[0].status;
      return requestStatus === filter;
    });
  };

  return {
    shiftCoverageRequests,
    pendingCount,
    acceptedCount,
    declinedCount,
    filterByStatus
  };
}
