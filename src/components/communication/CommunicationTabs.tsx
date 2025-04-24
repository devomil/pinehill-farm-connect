
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Announcement } from "@/types";
import { CommunicationFilter } from "./CommunicationFilter";
import { TabContent } from "./tabs/TabContent";
import { useAnnouncementFilters } from "@/hooks/useAnnouncementFilters";

interface CommunicationTabsProps {
  announcements: Announcement[];
  loading: boolean;
  isRead: (a: Announcement) => boolean;
  markAsRead: (id: string) => void;
  getPriorityBadge: (priority: string) => JSX.Element;
  currentUserId?: string;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
  onAttachmentAction?: (attachment: { name: string; type: string; url?: string }) => void;
  onAcknowledge?: (announcementId: string) => Promise<void>;
}

export const CommunicationTabs: React.FC<CommunicationTabsProps> = ({
  announcements,
  loading,
  isRead,
  markAsRead,
  getPriorityBadge,
  onEdit,
  onDelete,
  isAdmin,
  onAttachmentAction,
  onAcknowledge
}) => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    currentPage,
    setCurrentPage,
    dateRange,
    setDateRange,
    filterAnnouncements
  } = useAnnouncementFilters(announcements);

  const { announcements: allFiltered, totalPages: allTotalPages } = filterAnnouncements("all");
  const { announcements: unreadFiltered, totalPages: unreadTotalPages } = filterAnnouncements("unread");
  const { announcements: importantFiltered, totalPages: importantTotalPages } = filterAnnouncements("important");

  return (
    <Tabs defaultValue="all" onValueChange={value => { setActiveTab(value); setCurrentPage(1); }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <TabsList>
          <TabsTrigger value="all">All Announcements</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="important">Important</TabsTrigger>
        </TabsList>

        <CommunicationFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      <TabContent
        value="all"
        announcements={allFiltered}
        loading={loading}
        isRead={isRead}
        markAsRead={markAsRead}
        getPriorityBadge={getPriorityBadge}
        currentPage={currentPage}
        totalPages={allTotalPages}
        onPageChange={setCurrentPage}
        onEdit={onEdit}
        onDelete={onDelete}
        isAdmin={isAdmin}
        onAttachmentAction={onAttachmentAction}
        onAcknowledge={onAcknowledge}
      />

      <TabContent
        value="unread"
        announcements={unreadFiltered}
        loading={loading}
        isRead={isRead}
        markAsRead={markAsRead}
        getPriorityBadge={getPriorityBadge}
        currentPage={currentPage}
        totalPages={unreadTotalPages}
        onPageChange={setCurrentPage}
        onEdit={onEdit}
        onDelete={onDelete}
        isAdmin={isAdmin}
        onAttachmentAction={onAttachmentAction}
        onAcknowledge={onAcknowledge}
        emptyMessage={
          <div className="text-center p-6">
            <p className="text-lg font-medium">No unread announcements</p>
            <p className="text-muted-foreground">You're all caught up!</p>
          </div>
        }
      />

      <TabContent
        value="important"
        announcements={importantFiltered}
        loading={loading}
        isRead={isRead}
        markAsRead={markAsRead}
        getPriorityBadge={getPriorityBadge}
        currentPage={currentPage}
        totalPages={importantTotalPages}
        onPageChange={setCurrentPage}
        onEdit={onEdit}
        onDelete={onDelete}
        isAdmin={isAdmin}
        onAttachmentAction={onAttachmentAction}
        onAcknowledge={onAcknowledge}
        emptyMessage={
          <div className="text-center p-6">
            <p className="text-lg font-medium">No important announcements</p>
            <p className="text-muted-foreground">Check back later for important updates</p>
          </div>
        }
      />
    </Tabs>
  );
};
