
import { UseMutationResult } from "@tanstack/react-query";
import { SendMessageParams } from "@/types/communications/communicationTypes";
import { User } from "@/types";

/**
 * This hook standardizes the operations for sending messages and responding to shift requests
 * while handling compatibility between different parameter formats
 */
export const useMessageSendOperations = (
  sendMessageMutation: UseMutationResult<any, Error, SendMessageParams>,
  respondToShiftRequestMutation: UseMutationResult<any, Error, any>,
  refreshMessages: () => Promise<any>
) => {
  
  /**
   * Sends a message with properly standardized parameters
   */
  const sendMessage = async (params: SendMessageParams): Promise<{success: boolean, error?: string}> => {
    try {
      const result = await sendMessageMutation.mutateAsync(params);
      await refreshMessages();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error sending message' 
      };
    }
  };
  
  /**
   * Sends multiple messages to different recipients
   */
  const sendBulkMessages = async (
    recipients: User[],
    messageContent: string,
    type: string,
    shiftDetails?: any
  ): Promise<{success: boolean, error?: string}> => {
    try {
      // Send each message one by one
      for (const recipient of recipients) {
        await sendMessageMutation.mutateAsync({
          recipientId: recipient.id,
          message: messageContent,
          type: type as any,
          shiftDetails
        });
      }
      
      await refreshMessages();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error sending bulk messages' 
      };
    }
  };
  
  /**
   * Responds to a shift coverage request, adapting the parameter format
   */
  const respondToShiftRequest = async (
    data: {
      communicationId: string;
      shiftRequestId: string;
      accept: boolean;
      senderId: string;
    }
  ): Promise<{success: boolean, error?: string}> => {
    try {
      await respondToShiftRequestMutation.mutateAsync(data);
      await refreshMessages();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error responding to shift request' 
      };
    }
  };
  
  return {
    sendMessage,
    sendBulkMessages,
    respondToShiftRequest
  };
};
