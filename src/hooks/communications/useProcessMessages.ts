
import { useMemo } from "react";
import { User } from "@/types";
import { Communication, MessageType, MessageStatus } from "@/types/communications/communicationTypes";

/**
 * Hook to process and type-validate messages
 * This transforms raw database messages into properly typed Communication objects
 */
export function useProcessMessages(
  messages: any[] | null,
  currentUser: User | null
): Communication[] {
  return useMemo((): Communication[] => {
    if (!messages || !Array.isArray(messages) || messages.length === 0) return [];
    
    // Transform raw messages into properly typed Communication objects
    return messages.map(msg => {
      // Ensure message type is valid or default to 'general'
      const validTypes: MessageType[] = ['general', 'shift_coverage', 'urgent'];
      const messageType: MessageType = validTypes.includes(msg.type as MessageType) 
        ? msg.type as MessageType 
        : 'general';
      
      // Ensure message status is valid or default to 'pending'
      const validStatuses: MessageStatus[] = ['pending', 'accepted', 'declined'];
      const messageStatus: MessageStatus = validStatuses.includes(msg.status as MessageStatus)
        ? msg.status as MessageStatus
        : 'pending';
      
      // Process shift coverage requests with proper typing
      const typedShiftRequests = Array.isArray(msg.shift_coverage_requests) 
        ? msg.shift_coverage_requests.map((req: any) => ({
            ...req,
            status: validStatuses.includes(req.status as MessageStatus)
              ? req.status as MessageStatus
              : 'pending'
          }))
        : [];
      
      // Return a properly typed Communication object
      const typedMessage: Communication = {
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
      
      return typedMessage;
    });
  }, [messages, currentUser]);
}
