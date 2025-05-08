
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback } from "react";

export const useAnnouncementAcknowledge = (currentUserId: string | undefined) => {
  const { toast } = useToast();
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  const acknowledgeAnnouncement = useCallback(async (announcementId: string): Promise<void> => {
    if (!currentUserId) {
      console.error("No currentUserId provided to acknowledgeAnnouncement");
      return Promise.reject("No currentUserId available");
    }

    if (isAcknowledging) {
      console.log("Already processing an acknowledgment, please wait");
      return Promise.reject("Operation in progress");
    }

    try {
      setIsAcknowledging(true);
      console.log(`Acknowledging announcement ${announcementId} for user ${currentUserId}`);
      
      // Check if record exists first
      const { data: existingRecord, error: checkError } = await supabase
        .from("announcement_recipients")
        .select("*")
        .eq("announcement_id", announcementId)
        .eq("user_id", currentUserId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking announcement recipient:", checkError);
        toast({
          title: "Error acknowledging announcement",
          description: checkError.message,
          variant: "destructive"
        });
        return Promise.reject(checkError);
      }
      
      if (existingRecord) {
        // Check if already acknowledged
        if (existingRecord.acknowledged_at) {
          console.log("Announcement already acknowledged");
          return Promise.resolve(); // Already acknowledged, consider it a success
        }
        
        // Update existing record
        console.log("Updating existing acknowledgment record");
        const { error: updateError } = await supabase
          .from("announcement_recipients")
          .update({ 
            acknowledged_at: new Date().toISOString(),
            read_at: existingRecord.read_at || new Date().toISOString() // Also mark as read if not already
          })
          .eq("id", existingRecord.id);
          
        if (updateError) {
          console.error("Acknowledgment update error:", updateError);
          toast({
            title: "Failed to acknowledge announcement",
            description: updateError.message,
            variant: "destructive"
          });
          return Promise.reject(updateError);
        }
      } else {
        // Create new record
        console.log("Creating new acknowledgment record");
        const { error: insertError } = await supabase
          .from("announcement_recipients")
          .insert({
            announcement_id: announcementId,
            user_id: currentUserId,
            acknowledged_at: new Date().toISOString(),
            read_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error("Acknowledgment insert error:", insertError);
          toast({
            title: "Failed to acknowledge announcement",
            description: insertError.message,
            variant: "destructive"
          });
          return Promise.reject(insertError);
        }
      }
      
      console.log("Successfully acknowledged announcement");
      toast({
        title: "Announcement acknowledged",
        description: "Thank you for acknowledging this announcement"
      });
      return Promise.resolve();
      
    } catch (err) {
      console.error("Unexpected error in acknowledgeAnnouncement:", err);
      toast({
        title: "Failed to acknowledge announcement",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return Promise.reject(err);
    } finally {
      setIsAcknowledging(false);
    }
  }, [currentUserId, toast, isAcknowledging]);

  return { acknowledgeAnnouncement, isAcknowledging };
};
