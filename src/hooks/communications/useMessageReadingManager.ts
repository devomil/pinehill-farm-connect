
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "sonner";

export function useMessageReadingManager(currentUser: User | null) {
  const isMarking = useCallback(async (messageId: string): Promise<boolean> => {
    if (!currentUser?.id) return false;
    
    try {
      const { data, error } = await supabase
        .from('employee_communications')
        .select('read_at')
        .eq('id', messageId)
        .single();
        
      return data?.read_at !== null;
    } catch (error) {
      console.error("Error checking message read status:", error);
      return false;
    }
  }, [currentUser?.id]);
  
  const markMessageAsRead = useCallback(async (messageId: string): Promise<void> => {
    if (!currentUser?.id) {
      console.error("No current user ID available");
      return Promise.reject("No current user ID available");
    }
    
    try {
      console.log(`Marking message ${messageId} as read by ${currentUser.id}`);
      
      const { error } = await supabase
        .from('employee_communications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('recipient_id', currentUser.id);
        
      if (error) {
        console.error("Error marking message as read:", error);
        toast.error("Failed to mark message as read");
        return Promise.reject(error);
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast.error("Failed to mark message as read");
      return Promise.reject(error);
    }
  }, [currentUser?.id]);
  
  return { markMessageAsRead, isMarking };
}
