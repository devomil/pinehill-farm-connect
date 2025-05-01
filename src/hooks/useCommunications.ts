
import { useGetCommunications } from "./communications/useGetCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { useSendMessage } from "./communications/useSendMessage";
import { useRespondToShiftRequest } from "./communications/useRespondToShiftRequest";
import { useUnreadMessages } from "./communications/useUnreadMessages";
import { useRefreshMessages } from "./communications/useRefreshMessages";
import { Communication } from "@/types/communications/communicationTypes";
import { useEffect, useCallback } from "react";

export const useCommunications = () => {
  const { currentUser } = useAuth();
  const { data: messages, isLoading, error, refetch } = useGetCommunications(currentUser);
  const sendMessageMutation = useSendMessage(currentUser);
  const respondToShiftRequestMutation = useRespondToShiftRequest(currentUser);
  const refreshMessages = useCallback(() => {
    console.log("Manually refreshing communications data");
    return refetch();
  }, [refetch]);
  
  // Enhanced debug logging for communications
  useEffect(() => {
    console.log("useCommunications hook - Current user:", currentUser?.email);
    
    if (error) {
      console.error("Error loading communications:", error);
    }
    
    if (messages) {
      console.log(`Communications loaded successfully for ${currentUser?.email}: ${messages.length} messages`);
      
      // Log shift coverage requests specifically
      const shiftCoverageMessages = messages.filter(msg => msg.type === 'shift_coverage');
      console.log(`Shift coverage messages for ${currentUser?.email}:`, shiftCoverageMessages.length);
      
      if (shiftCoverageMessages.length > 0) {
        // Log each shift coverage message for debugging
        shiftCoverageMessages.forEach((msg, idx) => {
          console.log(`Shift message ${idx}: ${msg.id}, from ${msg.sender_id} to ${msg.recipient_id}`);
          
          if (msg.shift_coverage_requests?.length) {
            console.log(`  Request details: ${msg.shift_coverage_requests.length} requests, status: ${msg.shift_coverage_requests[0].status}`);
          } else {
            console.log("  No shift coverage requests in this message");
          }
        });
      }
    } else if (!isLoading && !error) {
      console.log(`No communications data found for ${currentUser?.email} but no error reported`);
    }
  }, [messages, isLoading, error, currentUser]);
  
  const unreadMessages = useUnreadMessages(messages as Communication[] | null, currentUser);

  const sendMessage = (params: any) => {
    console.log("Sending message with params:", params);
    return sendMessageMutation.mutate(params);
  };

  const respondToShiftRequest = (params: any) => {
    console.log("Responding to shift request with params:", params);
    return respondToShiftRequestMutation.mutate(params, {
      onSuccess: () => {
        // Invalidate and refetch communications data after successful mutation
        console.log("Successfully responded to shift request, refreshing messages");
        refreshMessages();
      }
    });
  };

  // Force initial fetch on first mount and set up more frequent periodic refresh
  useEffect(() => {
    console.log(`Initial communications fetch for ${currentUser?.email}`);
    refetch();
    
    // Set up a periodic refresh to ensure we catch new messages
    const refreshInterval = setInterval(() => {
      console.log("Periodic refresh of communications data");
      refetch();
    }, 15000); // Refresh every 15 seconds to ensure we don't miss updates
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [refetch, currentUser?.email]);

  return {
    messages: messages || [],
    unreadMessages,
    isLoading,
    error,
    sendMessage,
    respondToShiftRequest,
    refreshMessages
  };
};
