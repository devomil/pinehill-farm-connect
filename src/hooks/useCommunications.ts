
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useGetCommunications } from "./communications/useGetCommunications";
import { useSendMessage } from "./communications/useSendMessage";
import { useRespondToShiftRequest } from "./communications/useRespondToShiftRequest";
import { SendMessageParams, RespondToShiftRequestParams } from "@/types/communications";

export function useCommunications() {
  const { currentUser } = useAuth();
  
  const { data: messages, isLoading } = useGetCommunications(currentUser);
  const sendMessageMutation = useSendMessage(currentUser);
  const respondToShiftRequestMutation = useRespondToShiftRequest(currentUser);

  // Wrapper function to simplify the API for components
  const sendMessage = (params: SendMessageParams) => {
    return sendMessageMutation.mutate(params);
  };

  // Wrapper function to simplify the API for components
  const respondToShiftRequest = (params: RespondToShiftRequestParams) => {
    return respondToShiftRequestMutation.mutate(params);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    respondToShiftRequest
  };
}
