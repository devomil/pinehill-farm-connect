
import { UseMutationResult } from "@tanstack/react-query";
import { User } from "@/types";
import { SendMessageParams } from "@/types/communications/messageTypes";

interface MessageSendOperationsResult {
  sendMessage: (params: SendMessageParams) => Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendBulkMessages: (recipients: User[], messageContent: string, senderId: string, type: "general" | "urgent" | "system_notification") => Promise<{ success: boolean; error?: string }>;
  respondToShiftRequest: (messageId: string, response: "accepted" | "declined", responderId: string) => Promise<{ success: boolean; error?: string }>;
}

export const useMessageSendOperations = (
  sendMessageMutation: UseMutationResult<any, Error, SendMessageParams>,
  respondToShiftRequestMutation: UseMutationResult<any, Error, { messageId: string; response: string; responderId: string }>,
  refreshCallback: () => void
): MessageSendOperationsResult => {
  
  // Send an individual message
  const sendMessage = async (params: SendMessageParams) => {
    try {
      const result = await sendMessageMutation.mutateAsync(params);
      
      // Refresh data after sending
      setTimeout(() => refreshCallback(), 500);
      
      return { 
        success: true, 
        messageId: result?.id || result?.messageId
      };
    } catch (error) {
      console.error("Error sending message:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to send message" 
      };
    }
  };
  
  // Send message to multiple recipients at once
  const sendBulkMessages = async (
    recipients: User[],
    messageContent: string,
    senderId: string,
    type: "general" | "urgent" | "system_notification"
  ) => {
    try {
      const sendPromises = recipients.map(recipient => 
        sendMessage({
          recipientId: recipient.id,
          message: messageContent,
          senderId,
          type
        })
      );
      
      const results = await Promise.all(sendPromises);
      const failedSends = results.filter(r => !r.success);
      
      if (failedSends.length > 0) {
        return {
          success: false,
          error: `Failed to send ${failedSends.length} of ${recipients.length} messages`
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error in bulk sending:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send bulk messages"
      };
    }
  };
  
  // Respond to shift coverage request
  const respondToShiftRequest = async (messageId: string, response: "accepted" | "declined", responderId: string) => {
    try {
      await respondToShiftRequestMutation.mutateAsync({ 
        messageId, 
        response, 
        responderId 
      });
      
      // Refresh data after responding
      setTimeout(() => refreshCallback(), 500);
      
      return { success: true };
    } catch (error) {
      console.error("Error responding to shift request:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to respond to request" 
      };
    }
  };
  
  return {
    sendMessage,
    sendBulkMessages,
    respondToShiftRequest
  };
};
