
import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { useDebug } from "@/hooks/useDebug";

export const useAnnouncementDeleteManager = (
  handleDelete: (id: string) => Promise<boolean>,
  fetchAnnouncements: () => Promise<void>
) => {
  const debug = useDebug('hooks.announcement.deleteManager');

  // Handle deleting announcements
  const handleDeleteAnnouncement = useCallback(async (id: string): Promise<void> => {
    debug.info("Deleting announcement", { id });
    try {
      const success = await handleDelete(id);
      if (success) {
        await fetchAnnouncements();
        toast({
          description: "Announcement deleted successfully",
          variant: "success"
        });
        debug.info("Announcement deleted successfully", { id });
      }
    } catch (error) {
      debug.error("Error deleting announcement", error);
      toast({
        description: "Failed to delete announcement",
        variant: "destructive"
      });
    }
  }, [handleDelete, fetchAnnouncements, debug]);

  return {
    handleDeleteAnnouncement
  };
};
