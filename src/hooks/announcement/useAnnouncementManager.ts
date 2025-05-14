
import { useRef } from "react";
import { Announcement, User } from "@/types";
import { useAnnouncements } from "@/hooks/announcement/useAnnouncements";
import { useAnnouncementAcknowledge } from "@/hooks/announcement/useAnnouncementAcknowledge";
import { useAnnouncementReadStatus } from "@/hooks/announcement/useAnnouncementReadStatus";
import { useAnnouncementAttachmentHandler } from "@/components/communication/announcement/AnnouncementAttachmentHandler";
import { useDebug } from "@/hooks/useDebug";
import { useAnnouncementEditManager } from "./useAnnouncementEditManager";
import { useAnnouncementDeleteManager } from "./useAnnouncementDeleteManager";
import { useAnnouncementInteractionManager } from "./useAnnouncementInteractionManager";
import { useAnnouncementReadCheck } from "./useAnnouncementReadCheck";

export const useAnnouncementManager = (
  currentUser: User | null,
  allEmployees: User[],
  isAdmin: boolean
) => {
  const debug = useDebug('communication.announcement.manager', {
    trackRenders: true,
    logStateChanges: true
  });
  
  const mountedRef = useRef(true);
  
  const {
    announcements,
    loading,
    error,
    fetchAnnouncements,
    handleEdit,
    handleDelete
  } = useAnnouncements(currentUser, allEmployees);

  const { acknowledgeAnnouncement } = useAnnouncementAcknowledge(currentUser?.id);
  const { markAsRead } = useAnnouncementReadStatus(currentUser?.id);
  const { handleAttachmentAction } = useAnnouncementAttachmentHandler();

  // Use the extracted hooks
  const { isAnnouncementRead } = useAnnouncementReadCheck(currentUser?.id);
  
  const { handleMarkAsRead, handleAcknowledge } = useAnnouncementInteractionManager(
    currentUser,
    acknowledgeAnnouncement,
    markAsRead,
    fetchAnnouncements
  );

  const { handleDeleteAnnouncement } = useAnnouncementDeleteManager(
    handleDelete,
    fetchAnnouncements
  );

  const { 
    editingAnnouncement, 
    setEditingAnnouncement, 
    handleSaveEdit 
  } = useAnnouncementEditManager(
    handleEdit,
    fetchAnnouncements
  );

  return {
    announcements,
    loading,
    error,
    currentUser,
    isAdmin,
    editingAnnouncement,
    setEditingAnnouncement,
    isAnnouncementRead,
    handleMarkAsRead,
    handleDeleteAnnouncement,
    handleAcknowledge,
    handleAttachmentAction,
    handleSaveEdit,
    mountedRef,
    fetchAnnouncements
  };
};
