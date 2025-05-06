
import { useState, useMemo, useCallback } from "react";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";

export function useShiftCoverageFilters(messages: Communication[], currentUser: User) {
  const [latestFilterCall, setLatestFilterCall] = useState(Date.now());
  const [currentFilter, setCurrentFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  
  // Log filter debug info
  console.log(`Filtering shift requests by status: ${currentFilter}`);
  
  // Extract all shift coverage requests with useMemo
  const shiftCoverageRequests = useMemo(() => {
    if (!messages || !currentUser) {
      return [];
    }
    
    return messages.filter((message) => 
      message.type === "shift_coverage" && 
      // For non-admin users, only include messages they're involved in
      (
        currentUser.role === "admin" || // Admin users see all
        message.sender_id === currentUser.id || // User sent the request
        message.recipient_id === currentUser.id // User received the request
      )
    );
  }, [messages, currentUser, latestFilterCall]);
  
  // Count requests by status for filtering UI using useMemo
  const counts = useMemo(() => {
    const pending = shiftCoverageRequests.filter(req => 
      (req.shift_coverage_requests && req.shift_coverage_requests.length > 0 && 
      req.shift_coverage_requests[0]?.status === 'pending') || 
      (!req.shift_coverage_requests || req.shift_coverage_requests.length === 0)
    );
    
    const accepted = shiftCoverageRequests.filter(req => 
      req.shift_coverage_requests && 
      req.shift_coverage_requests.length > 0 && 
      req.shift_coverage_requests[0]?.status === 'accepted'
    );
    
    const declined = shiftCoverageRequests.filter(req => 
      req.shift_coverage_requests && 
      req.shift_coverage_requests.length > 0 && 
      req.shift_coverage_requests[0]?.status === 'declined'
    );
    
    return {
      pendingCount: pending.length,
      acceptedCount: accepted.length,
      declinedCount: declined.length
    };
  }, [shiftCoverageRequests]);
  
  // Filter function wrapped in useCallback
  const filterByStatus = useCallback((status: 'all' | 'pending' | 'accepted' | 'declined', requests: Communication[]) => {
    // Don't set latest filter call here - it causes too many re-renders
    setCurrentFilter(status); // Just update the current filter for logging
    
    if (status === 'all') {
      return requests;
    }
    
    return requests.filter(req => {
      // For pending, include both explicitly pending and any without a status yet
      if (status === 'pending') {
        return (req.shift_coverage_requests && req.shift_coverage_requests.length > 0 && 
          req.shift_coverage_requests[0]?.status === 'pending') || 
          (!req.shift_coverage_requests || req.shift_coverage_requests.length === 0);
      }
      
      // For accepted/declined, only include those with matching status
      return req.shift_coverage_requests && 
        req.shift_coverage_requests.length > 0 && 
        req.shift_coverage_requests[0]?.status === status;
    });
  }, []);
  
  // Function to explicitly update filter - separate from the filtering function
  const updateFilter = useCallback(() => {
    setLatestFilterCall(Date.now());
  }, []);
  
  return {
    ...counts,
    shiftCoverageRequests,
    filterByStatus,
    updateFilter,
    currentFilter
  };
}
