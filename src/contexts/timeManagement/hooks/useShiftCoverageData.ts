
import { useState, useEffect, useMemo } from 'react';
import { useEmployeeDirectory } from '@/hooks/useEmployeeDirectory';
import { useCommunications } from '@/hooks/useCommunications';
import { Communication, MessageType } from '@/types/communications/communicationTypes';
import { User } from '@/types';
import { useRequestFiltering } from './useRequestFiltering';

export function useShiftCoverageData(currentUser: User | null) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { employees } = useEmployeeDirectory();
  const { filterShiftCoverageRequests } = useRequestFiltering();

  // Get communications data for shift coverage requests
  const { 
    messages: rawMessages, 
    isLoading: messagesLoading, 
    error: messagesError
  } = useCommunications(false);

  // Filter messages to show only shift coverage requests
  // Cast the raw messages to ensure they match the Communication type
  const shiftCoverageRequests = useMemo(() => {
    const typedMessages = rawMessages ? rawMessages.map(msg => ({
      ...msg,
      type: msg.type as MessageType // Ensure type is cast to MessageType
    })) as Communication[] : [];
    
    return filterShiftCoverageRequests(typedMessages, false);
  }, [rawMessages, filterShiftCoverageRequests]);

  // Set overall loading and error state
  useEffect(() => {
    setLoading(messagesLoading);
    if (messagesError) {
      setError(messagesError instanceof Error ? messagesError : new Error('Failed to load shift coverage data'));
    } else {
      setError(null);
    }
  }, [messagesLoading, messagesError]);

  // Get pending shift coverage requests
  const pendingRequests = useMemo(() => {
    return shiftCoverageRequests.filter(request => {
      if (!request.shift_coverage_requests || request.shift_coverage_requests.length === 0) return true;
      return request.shift_coverage_requests.some(req => req.status === 'pending');
    });
  }, [shiftCoverageRequests]);

  // Get user's shift coverage requests (for employee view)
  const userRequests = useMemo(() => {
    if (!currentUser) return [];
    return shiftCoverageRequests.filter(request => request.sender_id === currentUser.id);
  }, [shiftCoverageRequests, currentUser]);

  return {
    shiftCoverageRequests,
    pendingRequests,
    userRequests,
    loading,
    error
  };
}
