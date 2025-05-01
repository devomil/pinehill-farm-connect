
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
  function isValidMessageType(type: string): boolean {
    return ['general', 'shift_coverage', 'urgent'].includes(type);
  }

  function isValidMessageStatus(status: string): boolean {
    return ['pending', 'accepted', 'declined'].includes(status);
  }

  // Process messages with proper typing - explicitly return Communication[] type
  return useMemo((): Communication[] => {
    if (!messages || !messages.length) return [];
    
    return messages.map(msg => {
      // Cast message type to proper union type
      const messageType = isValidMessageType(msg.type) 
        ? msg.type as MessageType
        : 'general' as MessageType;
      
      // Cast message status to proper union type
      const messageStatus = isValidMessageStatus(msg.status)
        ? msg.status as MessageStatus
        : 'pending' as MessageStatus;
      
      // Process shift coverage requests to ensure they have proper types
      const typedShiftRequests = msg.shift_coverage_requests?.map((req: any) => {
        return {
          ...req,
          status: isValidMessageStatus(req.status)
            ? req.status as MessageStatus
            : 'pending' as MessageStatus
        };
      });
      
      // Build the properly typed message object
      return {
        ...msg,
        type: messageType,
        status: messageStatus,
        shift_coverage_requests: typedShiftRequests,
        admin_cc: msg.admin_cc,
        current_user_id: currentUser?.id
      } as Communication;
    });
  }, [messages, currentUser?.id]);
}
