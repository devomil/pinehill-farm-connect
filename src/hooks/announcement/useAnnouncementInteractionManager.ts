
import { useCallback } from "react";
import { User } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useDebug } from "@/hooks/useDebug";

export const useAnnouncementInteractionManager = (
  currentUser: User | null,
  acknowledgeAnnouncement: (id: string) => Promise<void>,
  markAsRead: (id: string) => Promise<void>,
  fetchAnnouncements: () => Promise<void>
) => {
  const debug = useDebug('hooks.announcement.interactionManager');

  // Handle acknowledgment by ID
  const handleAcknowledge = useCallback(async (announcementId: string): Promise<void> => {
    debug.info("Handling announcement acknowledgment", { announcementId });
    if (!currentUser?.id) {
      debug.error("No current user ID available");
      toast({
        description: "Unable to acknowledge: No user ID available",
        variant: "destructive"
      });
      return Promise.reject("No current user ID available");
    }

    try {
      await acknowledgeAnnouncement(announcementId);
      await fetchAnnouncements();
      toast({
        description: "Announcement acknowledged successfully",
        variant: "success"
      });
      debug.info("Announcement acknowledged successfully", { announcementId });
      return Promise.resolve();
    } catch (error) {
      debug.error("Error in handleAcknowledge", error);
      toast({
        description: "Failed to acknowledge announcement",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  }, [currentUser?.id, acknowledgeAnnouncement, fetchAnnouncements, debug]);

  // Handle mark as read for announcements with proper error handling
  const handleMarkAsRead = useCallback(async (id: string): Promise<void> => {
    debug.info("Mark as read clicked for", { id });
    if (!currentUser?.id) {
      debug.error("Cannot mark as read: No current user ID");
      toast({
        description: "Unable to mark as read: No user ID available",
        variant: "destructive"
      });
      return Promise.reject("No current user ID available");
    }
    
    try {
      await markAsRead(id);
      await fetchAnnouncements();
      debug.info("Announcement marked as read successfully", { id });
      return Promise.resolve();
    } catch (error) {
      debug.error("Error marking announcement as read", error);
      toast({
        description: "Failed to mark announcement as read",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  }, [currentUser?.id, markAsRead, fetchAnnouncements, debug]);

  return {
    handleAcknowledge,
    handleMarkAsRead
  };
};
