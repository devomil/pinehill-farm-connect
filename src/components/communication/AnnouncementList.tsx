
import React from "react";
import { Announcement } from "@/types";
import { AnnouncementCard } from "./AnnouncementCard";
import { AnnouncementPagination } from "./AnnouncementPagination";
import {
  AnnouncementLoading,
  AnnouncementEmptyAll,
} from "./AnnouncementListState";

interface AnnouncementListProps {
  announcements: Announcement[];
  loading: boolean;
  isRead: (a: Announcement) => boolean;
  markAsRead: (id: string) => void;
  getPriorityBadge: (priority: string) => JSX.Element;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  emptyComponent?: React.ReactNode;
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
  emptyComponent = <AnnouncementEmptyAll />
}) => {
  if (loading) {
    return <AnnouncementLoading />;
  }

  if (announcements.length === 0) {
    return <>{emptyComponent}</>;
  }

  return (
    <div className="space-y-4">
      {announcements.map(announcement => (
        <AnnouncementCard
          key={announcement.id}
          announcement={announcement}
          isRead={isRead(announcement)}
          onMarkAsRead={() => markAsRead(announcement.id)}
          showMarkAsRead={true}
          getPriorityBadge={getPriorityBadge}
        />
      ))}
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
