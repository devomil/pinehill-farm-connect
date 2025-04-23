
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAnnouncementDelete = () => {
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Announcement deleted",
        description: "The announcement has been successfully deleted",
      });
      return true;
    } catch (err: any) {
      console.error('Error deleting announcement:', err);
      toast({
        title: "Error",
        description: "Failed to delete the announcement",
        variant: "destructive"
      });
      return false;
    }
  };

  return { handleDelete };
};
