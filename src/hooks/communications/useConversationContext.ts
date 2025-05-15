
import { useMemo } from 'react';
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";

export function useConversationContext(
  selectedEmployee: User | null,
  processedMessages: Communication[],
  currentUser: User | null,
  unfilteredEmployees: User[]
) {
  // Get filtered messages for the selected employee - with null checks
  const filteredMessages = useMemo(() => {
    if (!selectedEmployee || !currentUser) return [];
    
    return processedMessages.filter(
      (message) =>
        (message.sender_id === selectedEmployee.id && message.recipient_id === currentUser?.id) ||
        (message.recipient_id === selectedEmployee.id && message.sender_id === currentUser?.id)
    );
  }, [selectedEmployee, processedMessages, currentUser]);

  // Get conversation partners to show recent conversations - with null checks
  const conversationPartners = useMemo(() => {
    if (!currentUser || !unfilteredEmployees.length) return [];
    
    const uniqueIds = new Set<string>();
    const partners: User[] = [];
    
    processedMessages.forEach(message => {
      const otherId = message.sender_id === currentUser?.id ? message.recipient_id : message.sender_id;
      if (!uniqueIds.has(otherId)) {
        uniqueIds.add(otherId);
        const partner = unfilteredEmployees.find(emp => emp.id === otherId);
        if (partner) partners.push(partner);
      }
    });
    
    return partners;
  }, [processedMessages, unfilteredEmployees, currentUser]);

  // Create message sender function - with additional guard clauses
  const createMessageSender = (
    selectedEmployee: User | null, 
    currentUser: User | null, 
    sendMessage: (params: any) => Promise<any>
  ) => {
    return (message: string) => {
      if (!selectedEmployee || !currentUser || !message.trim()) {
        console.log("Cannot send message: missing employee, user, or empty message");
        return Promise.reject(new Error("Cannot send message"));
      }
      
      return sendMessage({
        recipientId: selectedEmployee.id,
        message,
        type: "general",
      });
    };
  };

  return {
    filteredMessages,
    conversationPartners,
    createMessageSender
  };
}
