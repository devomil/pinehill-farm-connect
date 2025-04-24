
import { Announcement } from "@/types";
import { useAnnouncementEdit } from "./useAnnouncementEdit";
import { useAnnouncementDelete } from "./useAnnouncementDelete";
import { useToast } from "@/hooks/use-toast";

export const useAnnouncementActions = () => {
  const { handleEdit: editAnnouncement } = useAnnouncementEdit();
  const { handleDelete: deleteAnnouncement } = useAnnouncementDelete();
  const { toast } = useToast();

  const handleEdit = async (announcement: Announcement) => {
    try {
      console.log("Handling edit for announcement:", announcement.id);
      const success = await editAnnouncement(announcement);
      
      if (success) {
        toast({
          title: "Announcement updated",
          description: "The announcement has been successfully updated",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error in handleEdit:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the announcement",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log("Handling delete for announcement:", id);
      const success = await deleteAnnouncement(id);
      
      if (success) {
        toast({
          title: "Announcement deleted",
          description: "The announcement has been successfully deleted",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast({
        title: "Delete failed",
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
