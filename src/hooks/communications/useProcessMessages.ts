
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
      
      // Process shift coverage requests with proper typing and validation
      const typedShiftRequests = Array.isArray(msg.shift_coverage_requests) 
        ? msg.shift_coverage_requests.map((req: any) => {
            // Ensure each request has a valid status
            const requestStatus: MessageStatus = validStatuses.includes(req.status as MessageStatus)
              ? req.status as MessageStatus
              : 'pending';
              
            // Return a properly typed shift coverage request
            return {
              id: req.id,
              communication_id: req.communication_id,
              original_employee_id: req.original_employee_id,
              covering_employee_id: req.covering_employee_id,
              shift_date: req.shift_date,
              shift_start: req.shift_start,
              shift_end: req.shift_end,
              status: requestStatus,
              created_at: req.created_at,
              updated_at: req.updated_at
            };
          })
        : [];
      
      // Special debug for shift coverage requests
      if (messageType === 'shift_coverage') {
        console.log(`Processing shift coverage message ${msg.id}`);
        
        if (typedShiftRequests.length > 0) {
          console.log(`Message has ${typedShiftRequests.length} shift requests`);
          console.log(`Message is ${msg.sender_id === currentUser?.id ? 'sent by' : 'received by'} current user`);
          console.log(`Shift request details: date=${typedShiftRequests[0].shift_date}, start=${typedShiftRequests[0].shift_start}, status=${typedShiftRequests[0].status}`);
        } else {
          console.log(`WARNING: Shift coverage message ${msg.id} has no shift requests data!`);
        }
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
    
    if (shiftCoverageMessages.length > 0) {
      // Log sample message for debugging
      const sample = shiftCoverageMessages[0];
      console.log("Sample shift coverage message after processing:", {
        id: sample.id,
        sender: sample.sender_id,
        recipient: sample.recipient_id,
        requestStatus: sample.shift_coverage_requests![0].status,
        date: sample.shift_coverage_requests![0].shift_date
      });
    }
    
    return processed;
  }, [messages, currentUser]);
}
