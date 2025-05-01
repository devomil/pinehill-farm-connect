
import { useGetCommunications } from "./communications/useGetCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { useSendMessage } from "./communications/useSendMessage";
import { useRespondToShiftRequest } from "./communications/useRespondToShiftRequest";
import { useUnreadMessages } from "./communications/useUnreadMessages";
import { useRefreshMessages } from "./communications/useRefreshMessages";
import { Communication } from "@/types/communications/communicationTypes";
import { useEffect } from "react";

export const useCommunications = () => {
  const { currentUser } = useAuth();
  const { data: messages, isLoading, error, refetch } = useGetCommunications(currentUser);
  const sendMessageMutation = useSendMessage(currentUser);
  const respondToShiftRequestMutation = useRespondToShiftRequest(currentUser);
  const refreshMessages = useRefreshMessages();
  
  // Enhanced debug logging for communications
  useEffect(() => {
    if (error) {
      console.error("Error loading communications:", error);
    }
    
    if (messages) {
      console.log("Communications loaded successfully:", messages.length);
      
      // Log shift coverage requests
      const shiftCoverageMessages = messages.filter(msg => msg.type === 'shift_coverage');
      console.log("Shift coverage messages:", shiftCoverageMessages.length);
      
      if (shiftCoverageMessages.length > 0) {
        console.log("Sample shift coverage message:", shiftCoverageMessages[0]);
        console.log("Shift coverage requests in sample:", 
          shiftCoverageMessages[0]?.shift_coverage_requests?.length || 0);
      }
    } else if (!isLoading && !error) {
      console.log("No communications data found but no error reported");
    }
  }, [messages, isLoading, error]);
  
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

  // Force initial fetch on first mount
  useEffect(() => {
    console.log("Initial communications fetch");
    refetch();
  }, [refetch]);

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
