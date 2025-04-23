
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnnouncementList } from "./AnnouncementList";
import { CommunicationFilter } from "./CommunicationFilter";
import { Announcement } from "@/types";
import { DateRange } from "react-day-picker";

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
}

export const CommunicationTabs: React.FC<CommunicationTabsProps> = ({
  announcements,
  loading,
  isRead,
  markAsRead,
  getPriorityBadge,
  currentUserId,
  onEdit,
  onDelete,
  isAdmin,
  onAttachmentAction
}) => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const itemsPerPage = 10;

  const filterAnnouncements = (tabType: string) => {
    let filtered = [...announcements];

    // Apply tab filter
    if (tabType === "unread") {
      filtered = filtered.filter(a => !isRead(a));
    } else if (tabType === "important") {
      filtered = filtered.filter(a => a.priority === "important" || a.priority === "urgent");
    }

    // Apply search filter
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      filtered = filtered.filter(
        a => 
          a.title.toLowerCase().includes(term) ||
          a.content.toLowerCase().includes(term) ||
          a.author.toLowerCase().includes(term)
      );
    }

    // Apply priority filter
    if (priorityFilter && priorityFilter !== 'all') {
      filtered = filtered.filter(a => a.priority === priorityFilter);
    }

    // Apply date range filter
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(a => {
        const announcementDate = new Date(a.createdAt);
        return announcementDate >= fromDate;
      });
    }

    if (dateRange?.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(a => {
        const announcementDate = new Date(a.createdAt);
        return announcementDate <= toDate;
      });
    }

    return filtered;
  };

  const getFilteredAnnouncements = (tabType: string) => {
    const filtered = filterAnnouncements(tabType);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    
    // Paginate
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);
    
    return { announcements: paginated, totalPages };
  };

  const { announcements: allFiltered, totalPages: allTotalPages } = getFilteredAnnouncements("all");
  const { announcements: unreadFiltered, totalPages: unreadTotalPages } = getFilteredAnnouncements("unread");
  const { announcements: importantFiltered, totalPages: importantTotalPages } = getFilteredAnnouncements("important");

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

      <TabsContent value="all" className="mt-0">
        <AnnouncementList
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
        />
      </TabsContent>

      <TabsContent value="unread" className="mt-0">
        <AnnouncementList
          announcements={unreadFiltered}
          loading={loading}
          isRead={isRead}
          markAsRead={markAsRead}
          getPriorityBadge={getPriorityBadge}
          currentPage={currentPage}
          totalPages={unreadTotalPages}
          onPageChange={setCurrentPage}
          emptyComponent={
            <div className="text-center p-6">
              <p className="text-lg font-medium">No unread announcements</p>
              <p className="text-muted-foreground">You're all caught up!</p>
            </div>
          }
          onEdit={onEdit}
          onDelete={onDelete}
          isAdmin={isAdmin}
          onAttachmentAction={onAttachmentAction}
        />
      </TabsContent>

      <TabsContent value="important" className="mt-0">
        <AnnouncementList
          announcements={importantFiltered}
          loading={loading}
          isRead={isRead}
          markAsRead={markAsRead}
          getPriorityBadge={getPriorityBadge}
          currentPage={currentPage}
          totalPages={importantTotalPages}
          onPageChange={setCurrentPage}
          emptyComponent={
            <div className="text-center p-6">
              <p className="text-lg font-medium">No important announcements</p>
              <p className="text-muted-foreground">Check back later for important updates</p>
            </div>
          }
          onEdit={onEdit}
          onDelete={onDelete}
          isAdmin={isAdmin}
          onAttachmentAction={onAttachmentAction}
        />
      </TabsContent>
    </Tabs>
  );
};

