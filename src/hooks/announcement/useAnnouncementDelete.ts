
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useAnnouncementDelete = () => {
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Announcement deleted", "The announcement has been successfully deleted");
      return true;
    } catch (err: any) {
      console.error('Error deleting announcement:', err);
      toast.error("Error", "Failed to delete the announcement");
      return false;
    }
  };

  return { handleDelete };
};
