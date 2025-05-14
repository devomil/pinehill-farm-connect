
import { useMemo } from 'react';
import { TimeOffRequest } from '@/types/timeManagement';
import { Communication } from '@/types/communications/communicationTypes';

/**
 * Hook to filter time-off and shift coverage requests
 * Allows filtering out declined requests for cleaner calendar display
 */
export function useRequestFiltering() {
  /**
   * Filter time off requests based on status
   * @param requests - Array of time off requests
   * @param includeDeclined - Whether to include declined requests (default: false)
   * @returns Filtered array of time off requests
   */
  const filterTimeOffRequests = (
    requests: TimeOffRequest[] | null, 
    includeDeclined: boolean = false
  ): TimeOffRequest[] => {
    if (!requests || requests.length === 0) return [];
    
    return requests.filter(request => {
      // Always include approved and pending
      if (request.status === 'approved' || request.status === 'pending') {
        return true;
      }
      
      // Include declined only if specified
      return includeDeclined && request.status === 'rejected';
    });
  };

  /**
   * Filter shift coverage requests based on status
   * @param messages - Array of communication messages
   * @param includeDeclined - Whether to include declined requests (default: false)
   * @returns Filtered array of communication messages
   */
  const filterShiftCoverageRequests = (
    messages: Communication[] | null,
    includeDeclined: boolean = false
  ): Communication[] => {
    if (!messages || messages.length === 0) return [];
    
    return messages.filter(message => {
      if (message.type !== 'shift_coverage') return false;
      
      // If there are no shift_coverage_requests, treat as pending
      if (!message.shift_coverage_requests || message.shift_coverage_requests.length === 0) {
        return true;
      }
      
      // Check the status of the first shift coverage request
      const status = message.shift_coverage_requests[0]?.status;
      
      // Always include approved and pending
      if (status === 'accepted' || status === 'pending') {
        return true;
      }
      
      // Include declined only if specified
      return includeDeclined && status === 'declined';
    });
  };

  return {
    filterTimeOffRequests,
    filterShiftCoverageRequests
  };
}
