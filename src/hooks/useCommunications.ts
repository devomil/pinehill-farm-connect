
import { useGetCommunications } from "./communications/useGetCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { useSendMessage } from "./communications/useSendMessage";
import { useRespondToShiftRequest } from "./communications/useRespondToShiftRequest";
import { useUnreadMessages } from "./communications/useUnreadMessages";
import { useRefreshMessages } from "./communications/useRefreshMessages";
import { Communication } from "@/types/communications/communicationTypes";

export const useCommunications = () => {
  const { currentUser } = useAuth();
  const { data: messages, isLoading, error } = useGetCommunications(currentUser);
  const sendMessageMutation = useSendMessage(currentUser);
  const respondToShiftRequestMutation = useRespondToShiftRequest(currentUser);
  const refreshMessages = useRefreshMessages();
  
  // Add console logging for debugging
  if (error) {
    console.error("Error loading communications:", error);
  }
  
  if (messages) {
    console.log("Communications loaded successfully:", messages.length);
  } else if (!isLoading && !error) {
    console.log("No communications data found but no error reported");
  }
  
  const unreadMessages = useUnreadMessages(messages as Communication[] | null, currentUser);

  const sendMessage = (params: any) => {
    return sendMessageMutation.mutate(params);
  };

  const respondToShiftRequest = (params: any) => {
    return respondToShiftRequestMutation.mutate(params, {
      onSuccess: () => {
        // Invalidate and refetch communications data after successful mutation
        refreshMessages();
      }
    });
  };

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
