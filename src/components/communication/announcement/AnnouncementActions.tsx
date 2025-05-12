
import React, { useState, useCallback } from "react";
import { Announcement, User } from "@/types";
import { EditAnnouncementDialog } from "@/components/communication/announcement/EditAnnouncementDialog";

interface AnnouncementActionsProps {
  editingAnnouncement: Announcement | null;
  setEditingAnnouncement: React.Dispatch<React.SetStateAction<Announcement | null>>;
  handleSaveEdit: (announcement: Announcement) => Promise<void>;
  loading: boolean;
  allEmployees: User[];
}

export const AnnouncementActionsManager: React.FC<AnnouncementActionsProps> = ({
  editingAnnouncement,
  setEditingAnnouncement,
  handleSaveEdit,
  loading,
  allEmployees
}) => {
  const handleCloseEditDialog = useCallback(() => {
    setEditingAnnouncement(null);
  }, [setEditingAnnouncement]);

  if (!editingAnnouncement) return null;

  return (
    <EditAnnouncementDialog
      announcement={editingAnnouncement}
      allEmployees={allEmployees}
      onClose={handleCloseEditDialog}
      onSave={handleSaveEdit}
      loading={loading}
    />
  );
};
