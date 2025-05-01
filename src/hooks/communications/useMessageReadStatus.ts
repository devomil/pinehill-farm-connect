
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";

/**
 * Hook to manage marking messages as read when viewing a conversation
 */
export function useMessageReadStatus(
  selectedEmployee: User | null,
  currentUser: User | null,
  unreadMessages: Communication[]
) {
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!selectedEmployee || !currentUser || unreadMessages.length === 0) return;

      // Find unread messages from the selected employee
      const toMarkAsRead = unreadMessages.filter(
        msg => msg.sender_id === selectedEmployee.id && msg.recipient_id === currentUser.id
      );
      
      if (toMarkAsRead.length === 0) return;
      
      console.log(`Marking ${toMarkAsRead.length} messages as read`);
      
      const messageIds = toMarkAsRead.map(msg => msg.id);
      const { error } = await supabase
        .from('employee_communications')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds);
      
      if (error) {
        console.error("Error marking messages as read:", error);
      }
    };
    
    markMessagesAsRead();
  }, [selectedEmployee, currentUser, unreadMessages]);
}
