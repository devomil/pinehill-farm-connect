
import React, { memo } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { AnnouncementList } from "../AnnouncementList";
import { Announcement } from "@/types";

interface TabContentProps {
  value: string;
  announcements: Announcement[];
  loading: boolean;
  isRead: (a: Announcement) => boolean;
  markAsRead: (id: string) => Promise<void>;
  getPriorityBadge: (priority: string) => JSX.Element;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
  onAttachmentAction?: (attachment: { name: string; type: string; url?: string }) => void;
  onAcknowledge?: (announcementId: string) => Promise<void>;
  emptyMessage?: React.ReactNode;
}

export const TabContent: React.FC<TabContentProps> = memo(({
  value,
  announcements,
  loading,
  isRead,
  markAsRead,
  getPriorityBadge,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  isAdmin,
  onAttachmentAction,
  onAcknowledge,
  emptyMessage
}) => {
  // Debug the tab content
  console.log(`TabContent ${value} rendering with:`, {
    announcements: announcements.length,
    loading,
    currentPage,
    totalPages
  });

  return (
    <TabsContent value={value} className="mt-0">
      <AnnouncementList
        announcements={announcements}
        loading={loading}
        isRead={isRead}
        markAsRead={markAsRead}
        getPriorityBadge={getPriorityBadge}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        emptyComponent={emptyMessage}
        onEdit={onEdit}
        onDelete={onDelete}
        isAdmin={isAdmin}
        onAttachmentAction={onAttachmentAction}
        onAcknowledge={onAcknowledge}
      />
    </TabsContent>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.value === nextProps.value &&
    prevProps.loading === nextProps.loading &&
    prevProps.currentPage === nextProps.currentPage &&
    prevProps.totalPages === nextProps.totalPages &&
    prevProps.announcements.length === nextProps.announcements.length &&
    JSON.stringify(prevProps.announcements.map(a => a.id)) === 
      JSON.stringify(nextProps.announcements.map(a => a.id))
  );
});

TabContent.displayName = 'TabContent';
