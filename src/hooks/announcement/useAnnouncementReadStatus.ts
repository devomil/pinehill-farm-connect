
import { useState } from "react";
import { Announcement } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAnnouncementReadStatus = (currentUserId: string | undefined) => {
  const { toast } = useToast();
  const [isMarking, setIsMarking] = useState(false);

  const markAsRead = async (id: string) => {
    if (!currentUserId) return false;
    if (isMarking) return false;
    
    try {
      setIsMarking(true);
      
      const { data: existingRead, error: checkError } = await supabase
        .from("announcement_recipients")
        .select("*")
        .eq("announcement_id", id)
        .eq("user_id", currentUserId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking announcement recipient:", checkError);
        toast({ title: "Failed to mark as read", description: checkError.message, variant: "destructive" });
        return false;
      }
      
      if (existingRead) {
        if (existingRead.read_at) {
          // Already marked as read
          return true;
        }
        
        const { error: updateError } = await supabase
          .from("announcement_recipients")
          .update({ read_at: new Date().toISOString() })
          .eq("id", existingRead.id);
          
        if (updateError) {
          console.error("Mark as read update error:", updateError);
          toast({ title: "Failed to mark as read", description: updateError.message, variant: "destructive" });
          return false;
        }
      } else {
        // Create new read receipt
        const { error: insertError } = await supabase
          .from("announcement_recipients")
          .insert({
            announcement_id: id,
            user_id: currentUserId,
            read_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error("Mark as read insert error:", insertError);
          toast({ title: "Failed to mark as read", description: insertError.message, variant: "destructive" });
          return false;
        }
      }
      
      return true;
    } catch (err) {
      console.error("Unexpected error in markAsRead:", err);
      toast({ title: "Failed to mark as read", description: "An unexpected error occurred", variant: "destructive" });
      return false;
    } finally {
      setIsMarking(false);
    }
  };

  return { markAsRead, isMarking };
};
