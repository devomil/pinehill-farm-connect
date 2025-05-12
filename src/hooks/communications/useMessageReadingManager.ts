
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Communication } from "@/types";
import { toast } from "sonner";

interface MessageReadingResult {
  markMessageAsRead: (messageId: string) => Promise<boolean>;
  isMarking: boolean;
}

export const useMessageReadingManager = (currentUser: User | null): MessageReadingResult => {
  const [isMarking, setIsMarking] = useState(false);
  
  /**
   * Mark a single message as read
   */
  const markMessageAsRead = async (messageId: string): Promise<boolean> => {
    if (!currentUser?.id) {
      console.error("Cannot mark as read: No current user ID");
      return false;
    }
    
    try {
      setIsMarking(true);
      
      // Update the read_at timestamp for this message
      const { error } = await supabase
        .from('employee_communications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('recipient_id', currentUser.id);
      
      if (error) {
        console.error("Error marking message as read:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Exception marking message as read:", error);
      return false;
    } finally {
      setIsMarking(false);
    }
  };
  
  return {
    markMessageAsRead,
    isMarking
  };
};
