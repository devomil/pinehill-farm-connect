
import { useMemo } from "react";
import { User } from "@/types";
import { Communication, MessageType, MessageStatus } from "@/types/communications/communicationTypes";

/**
 * Hook to process and type-validate messages
 */
export function useProcessMessages(
  messages: any[] | null,
  currentUser: User | null
): Communication[] {
  // Helper functions for type validation
  function isValidMessageType(type: string): type is MessageType {
    return ['general', 'shift_coverage', 'urgent'].includes(type);
  }

  function isValidMessageStatus(status: string): status is MessageStatus {
    return ['pending', 'accepted', 'declined'].includes(status);
  }

  // Process messages with proper typing
  return useMemo((): Communication[] => {
    if (!messages || !messages.length) return [];
    
    return messages.map(msg => {
      // Validate and convert message type to MessageType enum
      const messageType: MessageType = isValidMessageType(msg.type) 
        ? msg.type as MessageType
        : 'general';
      
      // Validate and convert message status to MessageStatus enum
      const messageStatus: MessageStatus = isValidMessageStatus(msg.status)
        ? msg.status as MessageStatus
        : 'pending';
      
      // Process shift coverage requests with proper typing
      const typedShiftRequests = msg.shift_coverage_requests?.map((req: any) => {
        return {
          ...req,
          status: isValidMessageStatus(req.status)
            ? req.status as MessageStatus
            : 'pending' as MessageStatus
        };
      }) || [];
      
      // Return a properly typed Communication object
      return {
        id: msg.id,
        sender_id: msg.sender_id,
        recipient_id: msg.recipient_id,
        message: msg.message,
        type: messageType,
        created_at: msg.created_at,
        status: messageStatus,
        read_at: msg.read_at,
        admin_cc: msg.admin_cc,
        shift_coverage_requests: typedShiftRequests,
        current_user_id: currentUser?.id
      };
    });
  }, [messages, currentUser?.id]);
}
