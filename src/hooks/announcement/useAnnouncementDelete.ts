
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
      
      toast({
        description: "The announcement has been successfully deleted",
        variant: "success"
      });
      return true;
    } catch (err: any) {
      console.error('Error deleting announcement:', err);
      toast({
        description: "Failed to delete the announcement",
        variant: "destructive"
      });
      return false;
    }
  };

  return { handleDelete };
};
