
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAnnouncementReadStatus = (currentUserId: string | undefined) => {
  const { toast } = useToast();
  const [isMarking, setIsMarking] = useState(false);

  const markAsRead = async (id: string) => {
    if (!currentUserId) {
      console.error("No currentUserId provided to markAsRead");
      return false;
    }
    
    if (isMarking) {
      console.log("Already marking as read, please wait");
      return false;
    }
    
    try {
      setIsMarking(true);
      console.log(`Marking announcement ${id} as read for user ${currentUserId}`);
      
      // First check if a record exists
      const { data: existingRead, error: checkError } = await supabase
        .from("announcement_recipients")
        .select("*")
        .eq("announcement_id", id)
        .eq("user_id", currentUserId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking announcement recipient:", checkError);
        toast({ 
          title: "Failed to mark as read", 
          description: checkError.message, 
          variant: "destructive" 
        });
        return false;
      }
      
      let success = false;
      
      if (existingRead) {
        // Record exists, check if already read
        if (existingRead.read_at) {
          console.log("Announcement already marked as read");
          return true; // Already marked as read, consider it a success
        }
        
        // Update existing record
        const { error: updateError } = await supabase
          .from("announcement_recipients")
          .update({ read_at: new Date().toISOString() })
          .eq("id", existingRead.id);
          
        if (updateError) {
          console.error("Mark as read update error:", updateError);
          toast({ 
            title: "Failed to mark as read", 
            description: updateError.message, 
            variant: "destructive" 
          });
        } else {
          success = true;
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
          toast({ 
            title: "Failed to mark as read", 
            description: insertError.message, 
            variant: "destructive" 
          });
        } else {
          success = true;
          console.log("Successfully created read receipt");
        }
      }
      
      if (success) {
        toast({
          title: "Marked as read",
          description: "Announcement has been marked as read"
        });
        console.log("Successfully marked announcement as read");
      }
      
      return success;
    } catch (err) {
      console.error("Unexpected error in markAsRead:", err);
      toast({ 
        title: "Failed to mark as read", 
        description: "An unexpected error occurred", 
        variant: "destructive" 
      });
      return false;
    } finally {
      setIsMarking(false);
    }
  };

  return { markAsRead, isMarking };
};
