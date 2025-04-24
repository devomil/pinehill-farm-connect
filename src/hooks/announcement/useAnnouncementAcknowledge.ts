
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAnnouncementAcknowledge = (currentUserId: string | undefined) => {
  const { toast } = useToast();

  const acknowledgeAnnouncement = async (announcementId: string) => {
    if (!currentUserId) {
      console.error("No currentUserId provided to acknowledgeAnnouncement");
      return false;
    }

    try {
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
        return false;
      }
      
      let error;
      
      if (existingRecord) {
        // Update existing record
        console.log("Updating existing acknowledgment record");
        const { error: updateError } = await supabase
          .from("announcement_recipients")
          .update({ 
            acknowledged_at: new Date().toISOString(),
            read_at: existingRecord.read_at || new Date().toISOString() // Also mark as read if not already
          })
          .eq("announcement_id", announcementId)
          .eq("user_id", currentUserId);
          
        error = updateError;
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
          
        error = insertError;
      }
        
      if (error) {
        console.error("Acknowledgment error:", error);
        toast({
          title: "Failed to acknowledge announcement",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Unexpected error in acknowledgeAnnouncement:", err);
      toast({
        title: "Failed to acknowledge announcement",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  return { acknowledgeAnnouncement };
};
