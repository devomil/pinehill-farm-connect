
import { useGetCommunications } from "./communications";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";
import { useSendMessage } from "./communications/useSendMessage";
import { useRespondToShiftRequest } from "./communications/useRespondToShiftRequest";
import { SendMessageParams, RespondToShiftRequestParams } from "@/types/communications/communicationTypes";

export const useCommunications = () => {
  const { currentUser } = useAuth();
  const { data: messages, isLoading, error } = useGetCommunications(currentUser);
  const sendMessageMutation = useSendMessage(currentUser);
  const respondToShiftRequestMutation = useRespondToShiftRequest(currentUser);
  
  const unreadMessages = useMemo(() => {
    if (!messages || !currentUser) return [];
    
    // Filter messages to find unread ones directed to the current user
    return messages.filter(
      message => 
        message.recipient_id === currentUser.id && 
        !message.read_at
    );
  }, [messages, currentUser]);

  const sendMessage = (params: SendMessageParams) => {
    return sendMessageMutation.mutate(params);
  };

  const respondToShiftRequest = (params: RespondToShiftRequestParams) => {
    return respondToShiftRequestMutation.mutate(params);
  };
  
  return {
    messages,
    unreadMessages,
    isLoading,
    error,
    sendMessage,
    respondToShiftRequest
  };
};
