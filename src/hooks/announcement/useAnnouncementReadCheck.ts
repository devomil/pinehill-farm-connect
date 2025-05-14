
import { useCallback } from "react";
import { Announcement } from "@/types";

export const useAnnouncementReadCheck = (currentUserId: string | undefined) => {
  // Memoize the announcement read check function to prevent unnecessary recalculations
  const isAnnouncementRead = useCallback((announcement: Announcement) => {
    return announcement.readBy.includes(currentUserId || "");
  }, [currentUserId]);

  return {
    isAnnouncementRead
  };
};
