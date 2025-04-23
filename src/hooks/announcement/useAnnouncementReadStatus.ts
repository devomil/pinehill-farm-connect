
import { useState } from "react";
import { Announcement } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAnnouncementReadStatus = (currentUserId: string | undefined) => {
  const { toast } = useToast();

  const markAsRead = async (id: string) => {
    if (!currentUserId) return;
    
    try {
      const { data, error: checkError } = await supabase
        .from("announcement_recipients")
        .select("*")
        .eq("announcement_id", id)
        .eq("user_id", currentUserId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking announcement recipient:", checkError);
        toast({ title: "Failed to mark as read", description: checkError.message, variant: "destructive" });
        return;
      }
      
      let error;
      
      if (data) {
        const { error: updateError } = await supabase
          .from("announcement_recipients")
          .update({ read_at: new Date().toISOString() })
          .eq("announcement_id", id)
          .eq("user_id", currentUserId);
          
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("announcement_recipients")
          .insert({
            announcement_id: id,
            user_id: currentUserId,
            read_at: new Date().toISOString()
          });
          
        error = insertError;
      }
        
      if (error) {
        console.error("Mark as read error:", error);
        toast({ title: "Failed to mark as read", description: error.message, variant: "destructive" });
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Unexpected error in markAsRead:", err);
      toast({ title: "Failed to mark as read", description: "An unexpected error occurred", variant: "destructive" });
      return false;
    }
  };

  return { markAsRead };
};
