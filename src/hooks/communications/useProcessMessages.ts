
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
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log("No messages to process in useProcessMessages");
      return [];
    }
    
    console.log(`Processing ${messages.length} messages in useProcessMessages`);
    
    // Transform raw messages into properly typed Communication objects
    const processed = messages.map(msg => {
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
      
      // Special debug for shift coverage requests
      if (messageType === 'shift_coverage' && typedShiftRequests.length > 0) {
        console.log(`Processing shift coverage message ${msg.id} with ${typedShiftRequests.length} requests`);
        console.log(`Message is ${msg.sender_id === currentUser?.id ? 'sent by' : 'received by'} current user`);
        console.log(`Shift request details: date=${typedShiftRequests[0].shift_date}, start=${typedShiftRequests[0].shift_start}, status=${typedShiftRequests[0].status}`);
      }
      
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
    
    // Additional logging for processed shift coverage requests
    const shiftCoverageMessages = processed.filter(
      m => m.type === 'shift_coverage' && m.shift_coverage_requests && m.shift_coverage_requests.length > 0
    );
    
    console.log(`Processed ${processed.length} total messages, including ${shiftCoverageMessages.length} shift coverage messages with requests`);
    
    return processed;
  }, [messages, currentUser]);
}
