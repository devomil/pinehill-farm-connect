
import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MessageType, SendMessageParams, Communication } from "@/types/communications";
import { useMessageSendOperations } from "./useMessageSendOperations";

export function useEmployeeCommunications() {
  const { currentUser } = useAuth();
  const { sendMessage } = useMessageSendOperations();
  
  // Send message function that includes sender ID from current user
  const handleSendMessage = useCallback(async (params: SendMessageParams): Promise<boolean> => {
    if (!currentUser?.id) {
      console.error("Cannot send message: No sender ID available");
      return false;
    }
    
    // Add sender ID to params
    return sendMessage({
      recipientId: params.recipientId,
      message: params.message,
      senderId: currentUser.id,
      type: params.type as 'general' | 'shift_coverage' | 'urgent' | 'system_notification',
      shiftDetails: params.shiftDetails && {
        shift_date: params.shiftDetails.shift_date,
        shift_start: params.shiftDetails.shift_start,
        shift_end: params.shiftDetails.shift_end
      }
    });
  }, [currentUser?.id, sendMessage]);

  return { sendMessage: handleSendMessage };
}
