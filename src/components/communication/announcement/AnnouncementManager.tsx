
import React, { useState, useCallback, useEffect, useRef } from "react";
import { Announcement, User } from "@/types";
import { useAnnouncements } from "@/hooks/announcement/useAnnouncements";
import { useAnnouncementAcknowledge } from "@/hooks/announcement/useAnnouncementAcknowledge";
import { useAnnouncementReadStatus } from "@/hooks/announcement/useAnnouncementReadStatus";
import { AnnouncementErrorHandler } from "./AnnouncementErrorHandler";
import { AnnouncementActionsManager } from "./AnnouncementActions";
import { AnnouncementContent } from "./AnnouncementContent";
import { useAnnouncementAttachmentHandler } from "./AnnouncementAttachmentHandler";
import { toast } from "sonner";

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
  const mountedRef = useRef(true);
  
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
  
  // Cleanup mounted ref when component unmounts
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  // Handle saving edited announcements
  const handleSaveEdit = useCallback(async (updatedAnnouncement: Announcement): Promise<void> => {
    console.log("Saving edited announcement:", updatedAnnouncement);
    try {
      const success = await handleEdit(updatedAnnouncement);
      if (success && mountedRef.current) {
        setEditingAnnouncement(null);
        await fetchAnnouncements();
        toast.success("Announcement updated successfully");
      }
    } catch (error) {
      console.error("Error saving edited announcement:", error);
      toast.error("Failed to update announcement");
    }
  }, [handleEdit, fetchAnnouncements]);

  // Handle deleting announcements
  const handleDeleteAnnouncement = useCallback(async (id: string): Promise<void> => {
    console.log("Deleting announcement:", id);
    try {
      const success = await handleDelete(id);
      if (success && mountedRef.current) {
        await fetchAnnouncements();
        toast.success("Announcement deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to delete announcement");
    }
  }, [handleDelete, fetchAnnouncements]);

  // Handle acknowledgment by ID
  const handleAcknowledge = useCallback(async (announcementId: string): Promise<void> => {
    console.log("Handling announcement acknowledgment:", announcementId);
    if (!currentUser?.id) {
      console.error("No current user ID available");
      toast.error("Unable to acknowledge: No user ID available");
      return Promise.reject("No current user ID available");
    }

    try {
      await acknowledgeAnnouncement(announcementId);
      if (mountedRef.current) {
        await fetchAnnouncements();
        toast.success("Announcement acknowledged successfully");
      }
      return Promise.resolve();
    } catch (error) {
      console.error("Error in handleAcknowledge:", error);
      toast.error("Failed to acknowledge announcement");
      return Promise.reject(error);
    }
  }, [currentUser?.id, acknowledgeAnnouncement, fetchAnnouncements]);

  // Handle mark as read for announcements with proper error handling
  const handleMarkAsRead = useCallback(async (id: string): Promise<void> => {
    console.log("Mark as read clicked for:", id);
    if (!currentUser?.id) {
      console.error("Cannot mark as read: No current user ID");
      toast.error("Unable to mark as read: No user ID available");
      return Promise.reject("No current user ID available");
    }
    
    try {
      await markAsRead(id);
      if (mountedRef.current) {
        await fetchAnnouncements();
      }
      return Promise.resolve();
    } catch (error) {
      console.error("Error marking announcement as read:", error);
      toast.error("Failed to mark announcement as read");
      return Promise.reject(error);
    }
  }, [currentUser?.id, markAsRead, fetchAnnouncements]);

  const isAnnouncementRead = useCallback((announcement: Announcement) => {
    return announcement.readBy.includes(currentUser?.id || "");
  }, [currentUser?.id]);

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
