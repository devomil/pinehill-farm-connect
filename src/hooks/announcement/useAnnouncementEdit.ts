
import { Announcement } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useAnnouncementEdit = () => {
  const handleEdit = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({
          title: announcement.title,
          content: announcement.content,
          priority: announcement.priority,
          has_quiz: announcement.hasQuiz,
          target_type: announcement.target_type,
          attachments: announcement.attachments,
          requires_acknowledgment: announcement.requires_acknowledgment
        })
        .eq('id', announcement.id);
      
      if (error) throw error;
      
      toast.success("Success", "Announcement updated successfully");
      return true;
    } catch (err: any) {
      console.error('Error updating announcement:', err);
      toast.error("Error", "Failed to update the announcement");
      return false;
    }
  };

  return { handleEdit };
};
