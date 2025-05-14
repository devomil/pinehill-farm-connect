
import { useState, useCallback } from "react";
import { Announcement } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useDebug } from "@/hooks/useDebug";

export const useAnnouncementEditManager = (
  handleEdit: (announcement: Announcement) => Promise<boolean>,
  fetchAnnouncements: () => Promise<void>
) => {
  const debug = useDebug('hooks.announcement.editManager');
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  
  // Handle saving edited announcements
  const handleSaveEdit = useCallback(async (updatedAnnouncement: Announcement): Promise<void> => {
    debug.info("Saving edited announcement", { id: updatedAnnouncement.id });
    try {
      const success = await handleEdit(updatedAnnouncement);
      if (success) {
        setEditingAnnouncement(null);
        await fetchAnnouncements();
        toast({
          description: "Announcement updated successfully",
          variant: "success"
        });
        debug.info("Announcement updated successfully");
      }
    } catch (error) {
      debug.error("Error saving edited announcement", error);
      toast({
        description: "Failed to update announcement",
        variant: "destructive"
      });
    }
  }, [handleEdit, fetchAnnouncements, debug]);

  return {
    editingAnnouncement,
    setEditingAnnouncement,
    handleSaveEdit
  };
};
