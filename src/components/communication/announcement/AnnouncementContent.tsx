
import React from "react";
import { Announcement, User } from "@/types";
import { CommunicationTabs } from "@/components/communication/CommunicationTabs";
import { Badge } from "@/components/ui/badge";

interface AnnouncementContentProps {
  announcements: Announcement[];
  loading: boolean;
  currentUser: User | null;
  isAdmin: boolean;
  isRead: (announcement: Announcement) => boolean;
  markAsRead: (id: string) => Promise<void>;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => Promise<void>;
  onAcknowledge: (announcementId: string) => Promise<void>;
  onAttachmentAction: (attachment: { name: string; type: string; url?: string }) => void;
}

export const AnnouncementContent: React.FC<AnnouncementContentProps> = ({
  announcements,
  loading,
  currentUser,
  isAdmin,
  isRead,
  markAsRead,
  onEdit,
  onDelete,
  onAcknowledge,
  onAttachmentAction
}) => {
  // Debug announcement content props
  console.log("AnnouncementContent rendering with:", {
    announcements: announcements.length,
    loading,
    currentUserId: currentUser?.id,
    isAdmin
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "important":
        return <Badge variant="default">Important</Badge>;
      default:
        return <Badge variant="outline">FYI</Badge>;
    }
  };

  return (
    <CommunicationTabs
      announcements={announcements}
      loading={loading}
      isRead={isRead}
      markAsRead={markAsRead}
      getPriorityBadge={getPriorityBadge}
      currentUserId={currentUser?.id}
      onEdit={isAdmin ? onEdit : undefined}
      onDelete={isAdmin ? onDelete : undefined}
      isAdmin={isAdmin}
      onAttachmentAction={onAttachmentAction}
      onAcknowledge={onAcknowledge}
    />
  );
};
