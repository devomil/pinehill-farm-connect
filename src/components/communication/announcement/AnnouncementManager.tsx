
import React, { useEffect } from "react";
import { User } from "@/types";
import { useAnnouncementManager } from "@/hooks/announcement/useAnnouncementManager";
import { AnnouncementManagerContent } from "./AnnouncementManagerContent";
import { AnnouncementEditContainer } from "./AnnouncementEditContainer";

interface AnnouncementManagerProps {
  currentUser: User | null;
  allEmployees: User[];
  isAdmin: boolean;
}

export const AnnouncementManager: React.FC<AnnouncementManagerProps> = React.memo(({
  currentUser,
  allEmployees,
  isAdmin,
}) => {
  // Use our custom hook to manage all announcement state and actions
  const {
    announcements,
    loading,
    error,
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
  } = useAnnouncementManager(currentUser, allEmployees, isAdmin);
  
  // Cleanup mounted ref when component unmounts
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, [mountedRef]);

  return (
    <>
      <AnnouncementManagerContent
        announcements={announcements}
        loading={loading}
        error={error}
        currentUser={currentUser}
        isAdmin={isAdmin}
        isRead={isAnnouncementRead}
        markAsRead={handleMarkAsRead}
        onEdit={setEditingAnnouncement}
        onDelete={handleDeleteAnnouncement}
        onAcknowledge={handleAcknowledge}
        onAttachmentAction={handleAttachmentAction}
        onRefresh={fetchAnnouncements}
      />
      
      <AnnouncementEditContainer
        editingAnnouncement={editingAnnouncement}
        setEditingAnnouncement={setEditingAnnouncement}
        handleSaveEdit={handleSaveEdit}
        loading={loading}
        allEmployees={allEmployees}
      />
    </>
  );
});

AnnouncementManager.displayName = "AnnouncementManager";
