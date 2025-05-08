
import { useCallback } from "react";
import { User } from "@/types";
import { SendMessageParams } from "@/types/communications/communicationTypes";

/**
 * Hook to handle message sending operations
 */
export function useMessageSending(
  selectedEmployee: User | null,
  currentUser: User | null,
  sendMessage: (params: SendMessageParams) => void,
  handleSelectEmployee: (employee: User) => void,
  allEmployees: User[] | null
) {
  // Handle sending a direct message to the selected employee
  const handleSendMessage = useCallback((message: string) => {
    if (!selectedEmployee) return;
    
    sendMessage({
      recipientId: selectedEmployee.id,
      message,
      type: "general",
    });
  }, [selectedEmployee, sendMessage]);

  // Handle sending a new message with potential shift details
  const handleNewMessageSend = useCallback((data: {
    recipientId: string;
    message: string;
    type: 'general' | 'shift_coverage' | 'urgent';
    shiftDetails?: {
      shift_date: string;
      shift_start: string;
      shift_end: string;
    };
    adminCc?: string | null;
  }) => {
    // Convert SendMessageData to SendMessageParams by adding required fields for shift details
    const sendParams: SendMessageParams = {
      recipientId: data.recipientId,
      message: data.message,
      type: data.type,
    };
    
    // For shift coverage requests, only include adminCc if it's a valid value
    if (data.type === 'shift_coverage' && data.adminCc) {
      sendParams.adminCc = data.adminCc; // Will only be set if it's a valid UUID
    } else if (data.adminCc) {
      // For other message types, use the provided adminCc if available
      sendParams.adminCc = data.adminCc;
    }
    
    // Add shift details with appropriate field mapping if available
    if (data.shiftDetails) {
      sendParams.shiftDetails = {
        original_employee_id: currentUser?.id || '',
        covering_employee_id: data.recipientId,
        shift_date: data.shiftDetails.shift_date,
        shift_start: data.shiftDetails.shift_start,
        shift_end: data.shiftDetails.shift_end
      };
    }
    
    sendMessage(sendParams);
    
    // Find and select the employee that received the message
    if (allEmployees) {
      const recipient = allEmployees.find(emp => emp.id === data.recipientId);
      if (recipient) {
        handleSelectEmployee(recipient);
      }
    }
  }, [sendMessage, allEmployees, handleSelectEmployee, currentUser]);

  return {
    handleSendMessage,
    handleNewMessageSend
  };
}
