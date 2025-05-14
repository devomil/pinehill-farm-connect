
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useAnnouncementReadStatus = (userId: string | undefined) => {
  const [processing, setProcessing] = useState(false);

  const markAsRead = async (announcementId: string) => {
    if (!userId) {
      console.error("Cannot mark as read: No user ID provided");
      toast({
        title: "Error",
        description: "Cannot mark as read: User not authenticated",
        variant: "destructive"
      });
      return Promise.reject("No user ID provided");
    }

    setProcessing(true);
    try {
      console.log(`Marking announcement ${announcementId} as read for user ${userId}`);
      
      // First check if a recipient record exists
      const { data: existingRecipient, error: checkError } = await supabase
        .from("announcement_recipients")
        .select("*")
        .eq("user_id", userId)
        .eq("announcement_id", announcementId)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking recipient record:", checkError);
        throw checkError;
      }
      
      let error;
      if (existingRecipient) {
        // Update existing record if read_at is null
        if (!existingRecipient.read_at) {
          console.log("Updating existing recipient record");
          const { error: updateError } = await supabase
            .from("announcement_recipients")
            .update({ read_at: new Date().toISOString() })
            .eq("user_id", userId)
            .eq("announcement_id", announcementId);
          
          error = updateError;
        } else {
          console.log("Announcement already marked as read, skipping update");
        }
      } else {
        // Insert new record
        console.log("Creating new recipient record");
        const { error: insertError } = await supabase
          .from("announcement_recipients")
          .insert([
            {
              user_id: userId,
              announcement_id: announcementId,
              read_at: new Date().toISOString()
            }
          ]);
        
        error = insertError;
      }
      
      if (error) {
        console.error("Error marking announcement as read:", error);
        toast({
          title: "Error",
          description: "Failed to mark announcement as read",
          variant: "destructive"
        });
        return Promise.reject(error);
      }
      
      console.log("Successfully marked announcement as read");
      return Promise.resolve();
    } catch (error) {
      console.error("Unexpected error in markAsRead:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return Promise.reject(error);
    } finally {
      setProcessing(false);
    }
  };

  return {
    markAsRead,
    processing
  };
};
