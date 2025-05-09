
import React from "react";
import { AnnouncementCard } from "./AnnouncementCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AnnouncementPagination } from "./AnnouncementPagination";
import { AnnouncementListState } from "./AnnouncementListState";
import { Announcement } from "@/types";

interface AnnouncementListProps {
  announcements: Announcement[];
  loading: boolean;
  isRead: (announcement: Announcement) => boolean;
  markAsRead: (id: string) => Promise<void>;
  getPriorityBadge: (priority: string) => JSX.Element;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  emptyComponent?: React.ReactNode;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
  onAttachmentAction?: (attachment: { name: string; type: string; url?: string }) => void;
  onAcknowledge?: (announcementId: string) => Promise<void>;
}

export const AnnouncementList: React.FC<AnnouncementListProps> = ({
  announcements,
  loading,
  isRead,
  markAsRead,
  getPriorityBadge,
  currentPage,
  totalPages,
  onPageChange,
  emptyComponent,
  onEdit,
  onDelete,
  isAdmin,
  onAttachmentAction,
  onAcknowledge
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-md border">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/4 mb-4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (announcements.length === 0) {
    return emptyComponent || <AnnouncementListState />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {announcements.map((announcement) => {
          // Check if the current user has acknowledged this announcement
          const currentUserId = announcement.currentUserId || '';
          const acknowledgementsArray = announcement.acknowledgements || [];
          const isAcknowledged = acknowledgementsArray.includes(currentUserId);
          
          // Create a Promise-returning wrapper for markAsRead
          const handleMarkAsRead = async (): Promise<void> => {
            return markAsRead(announcement.id);
          };
          
          return (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isRead={isRead(announcement)}
              isAcknowledged={isAcknowledged}
              onMarkAsRead={handleMarkAsRead}
              onAcknowledge={announcement.requires_acknowledgment && onAcknowledge ? 
                () => onAcknowledge(announcement.id) : 
                undefined
              }
              showMarkAsRead={true}
              getPriorityBadge={getPriorityBadge}
              isAdmin={isAdmin}
              onEdit={onEdit}
              onDelete={onDelete}
              onAttachmentAction={onAttachmentAction}
            />
          );
        })}
      </div>
      
      {totalPages > 1 && (
        <AnnouncementPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};
