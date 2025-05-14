
import React from "react";
import { Announcement } from "@/types";
import { AnnouncementErrorHandler } from "./AnnouncementErrorHandler";
import { AnnouncementContent } from "./AnnouncementContent";
import ErrorBoundary from "@/components/debug/ErrorBoundary";

interface AnnouncementManagerContentProps {
  announcements: Announcement[];
  loading: boolean;
  error: Error | null;
  currentUser: any;
  isAdmin: boolean;
  isRead: (announcement: Announcement) => boolean;
  markAsRead: (id: string) => Promise<void>;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => Promise<void>;
  onAcknowledge: (announcementId: string) => Promise<void>;
  onAttachmentAction: (attachment: { name: string; type: string; url?: string }) => void;
  onRefresh: () => void;
}

export const AnnouncementManagerContent: React.FC<AnnouncementManagerContentProps> = ({
  announcements,
  loading,
  error,
  currentUser,
  isAdmin,
  isRead,
  markAsRead,
  onEdit,
  onDelete,
  onAcknowledge,
  onAttachmentAction,
  onRefresh
}) => {
  // If there's an error, render the error component
  if (error) {
    return <AnnouncementErrorHandler error={error} onRefresh={onRefresh} />;
  }

  return (
    <ErrorBoundary componentName="communication.announcement.content">
      <AnnouncementContent
        announcements={announcements}
        loading={loading}
        currentUser={currentUser}
        isAdmin={isAdmin}
        isRead={isRead}
        markAsRead={markAsRead}
        onEdit={onEdit}
        onDelete={onDelete}
        onAcknowledge={onAcknowledge}
        onAttachmentAction={onAttachmentAction}
      />
    </ErrorBoundary>
  );
};
