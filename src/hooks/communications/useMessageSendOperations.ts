
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "sonner";
import { useMessageValidation } from "./useMessageValidation";

export function useMessageSendOperations() {
  const { validateShiftCoverageMessage } = useMessageValidation();
  
  const sendMessage = useCallback(async (params: {
    recipientId: string,
    message: string,
    senderId: string,
    type: 'general' | 'shift_coverage' | 'urgent' | 'system_notification',
    shiftDetails?: {
      shift_date: string,
      shift_start: string,
      shift_end: string
    }
  }) => {
    console.log("Sending message with params:", params);
    
    // Validate shift coverage messages
    if (params.type === 'shift_coverage') {
      const isValid = validateShiftCoverageMessage(params);
      if (!isValid) return false;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: params.message,
          sender_id: params.senderId,
          recipient_id: params.recipientId,
          type: params.type,
          shift_details: params.shiftDetails,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
        return false;
      }

      toast.success("Message sent successfully");
      return true;
    } catch (err) {
      console.error("Unexpected error sending message:", err);
      toast.error("An unexpected error occurred");
      return false;
    }
  }, [validateShiftCoverageMessage]);

  const sendBulkMessages = useCallback(async (
    recipients: User[],
    messageContent: string,
    senderId: string,
    type: 'general' | 'system_notification' = 'general'
  ) => {
    if (!recipients.length) {
      toast.error("No recipients selected");
      return false;
    }

    try {
      const messages = recipients.map(recipient => ({
        content: messageContent,
        sender_id: senderId,
        recipient_id: recipient.id,
        type,
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('messages')
        .insert(messages);

      if (error) {
        console.error("Error sending bulk messages:", error);
        toast.error("Failed to send messages");
        return false;
      }

      toast.success(`Messages sent to ${recipients.length} recipients`);
      return true;
    } catch (err) {
      console.error("Unexpected error sending bulk messages:", err);
      toast.error("An unexpected error occurred");
      return false;
    }
  }, []);

  return { sendMessage, sendBulkMessages };
}
