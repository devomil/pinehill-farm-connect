
import { useMemo } from 'react';
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";
import { useDebug } from '@/hooks/useDebug';

export function useConversationContext(
  selectedEmployee: User | null,
  processedMessages: Communication[],
  currentUser: User | null,
  unfilteredEmployees: User[]
) {
  const debug = useDebug('useConversationContext', { logStateChanges: true });
  
  // Get filtered messages for the selected employee - with null checks
  const filteredMessages = useMemo(() => {
    if (!selectedEmployee || !currentUser) {
      debug.info("Cannot filter messages - missing employee or current user", {
        hasSelectedEmployee: !!selectedEmployee,
        hasCurrentUser: !!currentUser
      });
      return [];
    }
    
    debug.info("Filtering messages for conversation", {
      selectedEmployeeId: selectedEmployee.id,
      currentUserId: currentUser.id,
      totalMessages: processedMessages?.length || 0
    });
    
    const filtered = processedMessages.filter(
      (message) =>
        (message.sender_id === selectedEmployee.id && message.recipient_id === currentUser?.id) ||
        (message.recipient_id === selectedEmployee.id && message.sender_id === currentUser?.id)
    );
    
    debug.info("Filtered conversation messages", {
      filteredCount: filtered.length,
      firstMessage: filtered[0] ? {
        sender: filtered[0].sender_id,
        recipient: filtered[0].recipient_id,
        // Check if message has content property, use message property as fallback
        preview: filtered[0].message ? filtered[0].message.substring(0, 20) + '...' : 'No content'
      } : 'none'
    });
    
    return filtered;
  }, [selectedEmployee, processedMessages, currentUser, debug]);

  // Get conversation partners to show recent conversations - with null checks
  const conversationPartners = useMemo(() => {
    if (!currentUser || !unfilteredEmployees.length) {
      debug.info("Cannot determine conversation partners - missing user or employees", {
        hasCurrentUser: !!currentUser,
        employeesCount: unfilteredEmployees?.length || 0
      });
      return [];
    }
    
    try {
      const uniqueIds = new Set<string>();
      const partners: User[] = [];
      
      processedMessages.forEach(message => {
        if (!message.sender_id || !message.recipient_id) {
          debug.warn("Message has invalid sender or recipient", {
            message_id: message.id,
            sender_id: message.sender_id,
            recipient_id: message.recipient_id
          });
          return;
        }
        
        const otherId = message.sender_id === currentUser?.id ? message.recipient_id : message.sender_id;
        if (!uniqueIds.has(otherId)) {
          uniqueIds.add(otherId);
          const partner = unfilteredEmployees.find(emp => emp.id === otherId);
          if (partner) {
            partners.push(partner);
          } else {
            debug.warn("Could not find partner in employee list", {
              partner_id: otherId
            });
          }
        }
      });
      
      debug.info("Found conversation partners", {
        count: partners.length,
        partnerIds: partners.map(p => p.id)
      });
      
      return partners;
    } catch (error) {
      debug.error("Error determining conversation partners", error);
      return [];
    }
  }, [processedMessages, unfilteredEmployees, currentUser, debug]);

  // Create message sender function - with additional guard clauses
  const createMessageSender = (
    selectedEmployee: User | null, 
    currentUser: User | null, 
    sendMessage: (params: any) => Promise<any>
  ) => {
    return (message: string) => {
      if (!selectedEmployee || !currentUser || !message.trim()) {
        debug.error("Cannot send message: missing employee, user, or empty message", {
          hasSelectedEmployee: !!selectedEmployee,
          hasCurrentUser: !!currentUser,
          messageLength: message?.length || 0
        });
        return Promise.reject(new Error("Cannot send message"));
      }
      
      debug.info("Sending message", {
        to: selectedEmployee.name,
        recipientId: selectedEmployee.id,
        messageLength: message.length
      });
      
      return sendMessage({
        recipientId: selectedEmployee.id,
        message,
        type: "general",
      }).catch(error => {
        debug.error("Failed to send message", { error, recipient: selectedEmployee.id });
        throw error;
      });
    };
  };

  return {
    filteredMessages,
    conversationPartners,
    createMessageSender
  };
}
