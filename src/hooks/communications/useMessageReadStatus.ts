
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";
import { useRefreshMessages } from "./useRefreshMessages";
import { toast } from "sonner";

/**
 * Hook to manage marking messages as read when viewing a conversation
 */
export function useMessageReadStatus(
  selectedEmployee: User | null,
  currentUser: User | null,
  unreadMessages: Communication[]
) {
  const { refresh: refreshMessages } = useRefreshMessages();

  useEffect(() => {
    // Function to mark messages as read
    const markMessagesAsRead = async () => {
      if (!selectedEmployee || !currentUser || unreadMessages.length === 0) return;

      // Find unread messages from the selected employee
      // Only mark direct messages as read, explicitly check for direct message types
      const toMarkAsRead = unreadMessages.filter(
        msg => msg.sender_id === selectedEmployee.id && 
              msg.recipient_id === currentUser.id &&
              (msg.type === 'general' || msg.type === 'shift_coverage' || msg.type === 'urgent')
      );
      
      if (toMarkAsRead.length === 0) return;
      
      console.log(`Marking ${toMarkAsRead.length} messages as read from ${selectedEmployee.name}`);
      
      const messageIds = toMarkAsRead.map(msg => msg.id);
      const { error } = await supabase
        .from('employee_communications')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds);
      
      if (error) {
        console.error("Error marking messages as read:", error);
        toast.error("Failed to mark messages as read");
      } else {
        // Immediately refresh messages to update unread counts throughout the app
        console.log("Messages marked as read, refreshing message counts");
        // Force immediate refresh to update all badge counters across the app
        refreshMessages();
        
        // For admin users, do additional refreshes to ensure counts are updated
        if (currentUser.role === 'admin') {
          setTimeout(() => refreshMessages(), 500);
          setTimeout(() => refreshMessages(), 1500);
        }
      }
    };
    
    // Call the function when the selected employee changes or when unread messages change
    markMessagesAsRead();
  }, [selectedEmployee?.id, currentUser?.id, unreadMessages, refreshMessages]);
}
