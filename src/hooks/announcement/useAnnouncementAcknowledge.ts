
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useAnnouncementAcknowledge = (userId: string | undefined) => {
  const [processing, setProcessing] = useState(false);

  const acknowledgeAnnouncement = async (announcementId: string) => {
    if (!userId) {
      console.error("Cannot acknowledge: No user ID provided");
      return Promise.reject("No user ID provided");
    }

    setProcessing(true);
    try {
      console.log(`Acknowledging announcement ${announcementId} for user ${userId}`);
      
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
        // Update existing record
        console.log("Updating existing recipient record with acknowledgment");
        const { error: updateError } = await supabase
          .from("announcement_recipients")
          .update({ 
            acknowledged_at: new Date().toISOString(),
            read_at: existingRecipient.read_at || new Date().toISOString() // Also mark as read if not already
          })
          .eq("user_id", userId)
          .eq("announcement_id", announcementId);
        
        error = updateError;
      } else {
        // Insert new record
        console.log("Creating new recipient record with acknowledgment");
        const { error: insertError } = await supabase
          .from("announcement_recipients")
          .insert([
            {
              user_id: userId,
              announcement_id: announcementId,
              acknowledged_at: new Date().toISOString(),
              read_at: new Date().toISOString() // Also mark as read
            }
          ]);
        
        error = insertError;
      }
      
      if (error) {
        console.error("Error acknowledging announcement:", error);
        toast({
          title: "Error",
          description: "Failed to acknowledge announcement",
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Announcement acknowledged successfully",
        variant: "success"
      });
      
      console.log("Successfully acknowledged announcement");
      return Promise.resolve();
    } catch (error) {
      console.error("Unexpected error in acknowledgeAnnouncement:", error);
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
    acknowledgeAnnouncement,
    processing
  };
};
