
import React, { useState, useCallback } from "react";
import { Announcement, User } from "@/types";
import { useAnnouncements } from "@/hooks/announcement/useAnnouncements";
import { useAnnouncementAcknowledge } from "@/hooks/announcement/useAnnouncementAcknowledge";
import { useAnnouncementReadStatus } from "@/hooks/announcement/useAnnouncementReadStatus";
import { AnnouncementErrorHandler } from "./AnnouncementErrorHandler";
import { AnnouncementActionsManager } from "./AnnouncementActions";
import { AnnouncementContent } from "./AnnouncementContent";
import { useAnnouncementAttachmentHandler } from "./AnnouncementAttachmentHandler";

interface AnnouncementManagerProps {
  currentUser: User | null;
  allEmployees: User[];
  isAdmin: boolean;
}

export const AnnouncementManager: React.FC<AnnouncementManagerProps> = ({
  currentUser,
  allEmployees,
  isAdmin,
}) => {
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  
  const {
    announcements,
    loading,
    error,
    fetchAnnouncements,
    markAsRead: markAnnouncementReadInList,
    handleEdit,
    handleDelete
  } = useAnnouncements(currentUser, allEmployees);

  const { acknowledgeAnnouncement } = useAnnouncementAcknowledge(currentUser?.id);
  const { markAsRead } = useAnnouncementReadStatus(currentUser?.id);
  const { handleAttachmentAction } = useAnnouncementAttachmentHandler();
  
  // Handle saving edited announcements
  const handleSaveEdit = async (updatedAnnouncement: Announcement) => {
    console.log("Saving edited announcement:", updatedAnnouncement);
    const success = await handleEdit(updatedAnnouncement);
    if (success) {
      setEditingAnnouncement(null);
      fetchAnnouncements();
    }
  };

  // Handle deleting announcements
  const handleDeleteAnnouncement = async (id: string) => {
    console.log("Deleting announcement:", id);
    const success = await handleDelete(id);
    if (success) {
      fetchAnnouncements();
    }
  };

  // Handle acknowledgment by ID
  const handleAcknowledge = useCallback(async (announcementId: string): Promise<void> => {
    console.log("Handling announcement acknowledgment:", announcementId);
    if (!currentUser?.id) {
      console.error("No current user ID available");
      return Promise.reject("No current user ID available");
    }

    try {
      await acknowledgeAnnouncement(announcementId);
      await fetchAnnouncements();
      return Promise.resolve();
    } catch (error) {
      console.error("Error in handleAcknowledge:", error);
      return Promise.reject(error);
    }
  }, [currentUser?.id, acknowledgeAnnouncement, fetchAnnouncements]);

  // Handle mark as read for announcements
  const handleMarkAsRead = useCallback(async (id: string): Promise<void> => {
    console.log("Mark as read clicked for:", id);
    if (!currentUser?.id) {
      console.error("Cannot mark as read: No current user ID");
      return Promise.reject("No current user ID available");
    }
    
    try {
      await markAsRead(id);
      await fetchAnnouncements();
      return Promise.resolve();
    } catch (error) {
      console.error("Error marking announcement as read:", error);
      return Promise.reject(error);
    }
  }, [currentUser?.id, markAsRead, fetchAnnouncements]);

  const isAnnouncementRead = (announcement: Announcement) => {
    return announcement.readBy.includes(currentUser?.id || "");
  };

  // If there's an error, render the error component
  if (error) {
    return <AnnouncementErrorHandler error={error} onRefresh={fetchAnnouncements} />;
  }

  return (
    <>
      <AnnouncementContent
        announcements={announcements}
        loading={loading}
        currentUser={currentUser}
        isAdmin={isAdmin}
        isRead={isAnnouncementRead}
        markAsRead={handleMarkAsRead}
        onEdit={setEditingAnnouncement}
        onDelete={handleDeleteAnnouncement}
        onAcknowledge={handleAcknowledge}
        onAttachmentAction={handleAttachmentAction}
      />

      <AnnouncementActionsManager
        editingAnnouncement={editingAnnouncement}
        setEditingAnnouncement={setEditingAnnouncement}
        handleSaveEdit={handleSaveEdit}
        loading={loading}
        allEmployees={allEmployees}
      />
    </>
  );
};
