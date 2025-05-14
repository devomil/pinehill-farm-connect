
import React from "react";
import { Announcement, User } from "@/types";
import { AnnouncementActionsManager } from "./AnnouncementActions";
import ErrorBoundary from "@/components/debug/ErrorBoundary";

interface AnnouncementEditContainerProps {
  editingAnnouncement: Announcement | null;
  setEditingAnnouncement: React.Dispatch<React.SetStateAction<Announcement | null>>;
  handleSaveEdit: (announcement: Announcement) => Promise<void>;
  loading: boolean;
  allEmployees: User[];
}

export const AnnouncementEditContainer: React.FC<AnnouncementEditContainerProps> = ({
  editingAnnouncement,
  setEditingAnnouncement,
  handleSaveEdit,
  loading,
  allEmployees
}) => {
  if (!editingAnnouncement) return null;
  
  return (
    <ErrorBoundary componentName="communication.announcement.actions">
      <AnnouncementActionsManager
        editingAnnouncement={editingAnnouncement}
        setEditingAnnouncement={setEditingAnnouncement}
        handleSaveEdit={handleSaveEdit}
        loading={loading}
        allEmployees={allEmployees}
      />
    </ErrorBoundary>
  );
};
