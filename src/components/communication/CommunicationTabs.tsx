import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Announcement } from "@/types";
import { AnnouncementCard } from "./AnnouncementCard";
import {
  AnnouncementLoading,
  AnnouncementEmptyAll,
  AnnouncementEmptyUnread,
  AnnouncementEmptyUrgent
} from "./AnnouncementListState";
import { CommunicationFilter } from "./CommunicationFilter";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DateRange } from "react-day-picker";

interface CommunicationTabsProps {
  announcements: Announcement[];
  loading: boolean;
  isRead: (a: Announcement) => boolean;
  markAsRead: (id: string) => void;
  getPriorityBadge: (priority: string) => JSX.Element;
  currentUserId: string | undefined;
}

export const CommunicationTabs: React.FC<CommunicationTabsProps> = ({
  announcements,
  loading,
  isRead,
  markAsRead,
  getPriorityBadge,
  currentUserId
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("all");
  const [dateRange, setDateRange] = React.useState<DateRange>();
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

  const filterAnnouncements = (announcements: Announcement[]) => {
    return announcements.filter((announcement) => {
      const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === "all" || announcement.priority === priorityFilter;
      const matchesDate = !dateRange?.from || !dateRange?.to || 
                         (announcement.createdAt >= dateRange.from && 
                          announcement.createdAt <= dateRange.to);
      return matchesSearch && matchesPriority && matchesDate;
    });
  };

  const unreadAnnouncements = filterAnnouncements(announcements.filter(a => !isRead(a)));
  const urgentAnnouncements = filterAnnouncements(announcements.filter(a => a.priority === "urgent"));
  const allFilteredAnnouncements = filterAnnouncements(announcements);

  const paginateAnnouncements = (announcements: Announcement[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return announcements.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(allFilteredAnnouncements.length / itemsPerPage);

  const renderPagination = () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => (
          <PaginationItem key={i + 1}>
            <PaginationLink
              isActive={currentPage === i + 1}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="unread">
          Unread
          {unreadAnnouncements.length > 0 && (
            <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
              {unreadAnnouncements.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="urgent">Urgent</TabsTrigger>
      </TabsList>
      
      <CommunicationFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <TabsContent value="all" className="space-y-4 mt-4">
        {loading ? (
          <AnnouncementLoading />
        ) : allFilteredAnnouncements.length === 0 ? (
          <AnnouncementEmptyAll />
        ) : (
          <>
            {paginateAnnouncements(allFilteredAnnouncements).map(announcement => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                isRead={isRead(announcement)}
                onMarkAsRead={() => markAsRead(announcement.id)}
                showMarkAsRead={true}
                getPriorityBadge={getPriorityBadge}
              />
            ))}
            {allFilteredAnnouncements.length > itemsPerPage && renderPagination()}
          </>
        )}
      </TabsContent>

      <TabsContent value="unread" className="space-y-4 mt-4">
        {loading ? (
          <AnnouncementLoading />
        ) : unreadAnnouncements.length > 0 ? (
          unreadAnnouncements.map(announcement => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isRead={false}
              onMarkAsRead={() => markAsRead(announcement.id)}
              showMarkAsRead={true}
              getPriorityBadge={getPriorityBadge}
            />
          ))
        ) : (
          <AnnouncementEmptyUnread />
        )}
      </TabsContent>

      <TabsContent value="urgent" className="space-y-4 mt-4">
        {loading ? (
          <AnnouncementLoading />
        ) : urgentAnnouncements.length > 0 ? (
          urgentAnnouncements.map(announcement => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isRead={isRead(announcement)}
              onMarkAsRead={() => markAsRead(announcement.id)}
              showMarkAsRead={true}
              getPriorityBadge={getPriorityBadge}
            />
          ))
        ) : (
          <AnnouncementEmptyUrgent />
        )}
      </TabsContent>
    </Tabs>
  );
};
