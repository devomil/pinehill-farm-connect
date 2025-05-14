
import { Announcement } from "@/types";
import { useAnnouncementEdit } from "./useAnnouncementEdit";
import { useAnnouncementDelete } from "./useAnnouncementDelete";
import { toast } from "@/hooks/use-toast";

export const useAnnouncementActions = () => {
  const { handleEdit: editAnnouncement } = useAnnouncementEdit();
  const { handleDelete: deleteAnnouncement } = useAnnouncementDelete();

  const handleEdit = async (announcement: Announcement): Promise<boolean> => {
    try {
      console.log("Handling edit for announcement:", announcement.id);
      const success = await editAnnouncement(announcement);
      
      if (success) {
        toast({
          description: "The announcement has been successfully updated",
          variant: "success"
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error in handleEdit:", error);
      toast({
        description: "There was an error updating the announcement",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleDelete = async (id: string): Promise<boolean> => {
    try {
      console.log("Handling delete for announcement:", id);
      const success = await deleteAnnouncement(id);
      
      if (success) {
        toast({
          description: "The announcement has been successfully deleted",
          variant: "success"
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast({
        description: "There was an error deleting the announcement",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    handleEdit,
    handleDelete
  };
};
