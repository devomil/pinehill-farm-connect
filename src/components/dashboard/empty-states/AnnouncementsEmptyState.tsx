
import React from "react";
import { MessageSquare } from "lucide-react";
import { EmptyState } from "../EmptyState";

interface AnnouncementsEmptyStateProps {
  isAdmin?: boolean;
  onCreateAnnouncement?: () => void;
}

export const AnnouncementsEmptyState: React.FC<AnnouncementsEmptyStateProps> = ({ 
  isAdmin, 
  onCreateAnnouncement 
}) => {
  return (
    <EmptyState
      message={isAdmin 
        ? "No announcements have been created yet" 
        : "No announcements to display"
      }
      icon={<MessageSquare className="h-12 w-12 text-muted-foreground/50" />}
      action={isAdmin && onCreateAnnouncement ? {
        label: "Create Announcement",
        onClick: onCreateAnnouncement
      } : undefined}
    />
  );
};
