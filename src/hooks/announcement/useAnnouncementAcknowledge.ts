
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAnnouncementAcknowledge = (currentUserId: string | undefined) => {
  const { toast } = useToast();

  const acknowledgeAnnouncement = async (announcementId: string) => {
    if (!currentUserId) return false;

    try {
      const { error } = await supabase
        .from("announcement_recipients")
        .update({ acknowledged_at: new Date().toISOString() })
        .eq("announcement_id", announcementId)
        .eq("user_id", currentUserId);

      if (error) {
        console.error("Error acknowledging announcement:", error);
        toast({
          title: "Failed to acknowledge announcement",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Announcement acknowledged",
        description: "Thank you for acknowledging this announcement"
      });
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
