
import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "sonner";
import { User } from "@/types";
import { useLocation } from "react-router-dom";

export function useMessageReadingManager(currentUser: User | null) {
  const location = useLocation();
  const toast = useToast();
  const isOnMessagesTab = location.pathname === '/communication' && location.search.includes('tab=messages');

  // Auto-mark all messages as read for admin users when viewing messages tab
  const markAllMessagesAsRead = useCallback(async (unreadMessages: any[]) => {
    if (!isOnMessagesTab || !currentUser || currentUser.role !== 'admin') return;

    const trueUnreadMessages = unreadMessages.filter(msg => 
      (msg.type === 'general' || msg.type === 'shift_coverage' || msg.type === 'urgent') && 
      msg.read_at === null && 
      msg.recipient_id === currentUser.id
    );
    
    if (trueUnreadMessages.length === 0) return;
    
    console.log(`Admin user on messages tab, auto-marking ${trueUnreadMessages.length} messages as read`);
    
    const messageIds = trueUnreadMessages.map(msg => msg.id);
    
    try {
      const { error } = await supabase
        .from('employee_communications')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds);
          
      if (error) {
        console.error("Admin: Error auto-marking messages as read:", error);
      } else {
        console.log("Admin: Successfully marked all messages as read");
      }
    } catch (err) {
      console.error("Error in auto-mark messages as read:", err);
    }
  }, [isOnMessagesTab, currentUser]);

  return { markAllMessagesAsRead };
}
