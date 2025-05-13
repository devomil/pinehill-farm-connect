
import { User } from "@/types";
import { SendMessageParams, RespondToShiftRequestParams } from "@/types/communications/communicationTypes";
import { UseMutationResult } from "@tanstack/react-query";

export function useMessageSendOperations(
  sendMessageMutation: UseMutationResult<any, Error, SendMessageParams>,
  respondToShiftRequestMutation: UseMutationResult<any, Error, RespondToShiftRequestParams>,
  refreshMessages: () => Promise<any>
) {
  const sendMessage = async (params: SendMessageParams): Promise<any> => {
    try {
      const result = await sendMessageMutation.mutateAsync(params);
      await refreshMessages();
      return result;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const sendBulkMessages = async (recipients: User[], message: string, type: string = 'general'): Promise<any[]> => {
    const results = [];

    for (const recipient of recipients) {
      try {
        const result = await sendMessageMutation.mutateAsync({
          recipientId: recipient.id,
          message,
          type: type as any,
        });
        results.push(result);
      } catch (error) {
        console.error(`Error sending message to ${recipient.id}:`, error);
        results.push({ error });
      }
    }

    await refreshMessages();
    return results;
  };

  const respondToShiftRequest = async (params: RespondToShiftRequestParams): Promise<any> => {
    try {
      const result = await respondToShiftRequestMutation.mutateAsync(params);
      await refreshMessages();
      return result;
    } catch (error) {
      console.error("Error responding to shift request:", error);
      throw error;
    }
  };

  return {
    sendMessage,
    sendBulkMessages,
    respondToShiftRequest,
  };
}
