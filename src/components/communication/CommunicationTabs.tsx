
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Announcement } from "@/types";
import {
  AnnouncementEmptyUnread,
  AnnouncementEmptyUrgent
} from "./AnnouncementListState";
import { CommunicationFilter } from "./CommunicationFilter";
import { AnnouncementList } from "./AnnouncementList";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("all");
  const [dateRange, setDateRange] = React.useState<DateRange>();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState(announcements);
  const itemsPerPage = 5;

  const handleEdit = (announcement: Announcement) => {
    console.log("Edit announcement:", announcement);
  };

  const handleDelete = async (id: string) => {
    // We don't need to call setAnnouncements here, instead we'll emit the deletion
    // to the parent component through the props (handled in Communication.tsx)
    console.log("Delete announcement:", id);
  };

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

  // Make sure we're using currentUserId instead of currentUser
  const unreadAnnouncements = filterAnnouncements(announcements.filter(a => !isRead(a)));
  const urgentAnnouncements = filterAnnouncements(announcements.filter(a => a.priority === "urgent"));
  const allFilteredAnnouncements = filterAnnouncements(announcements);

  const paginateAnnouncements = (announcements: Announcement[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return announcements.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(allFilteredAnnouncements.length / itemsPerPage);

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
        <AnnouncementList
          announcements={paginateAnnouncements(allFilteredAnnouncements)}
          loading={loading}
          isRead={isRead}
          markAsRead={markAsRead}
          getPriorityBadge={getPriorityBadge}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isAdmin={currentUserId === "00000000-0000-0000-0000-000000000001"}
        />
      </TabsContent>

      <TabsContent value="unread" className="space-y-4 mt-4">
        <AnnouncementList
          announcements={unreadAnnouncements}
          loading={loading}
          isRead={isRead}
          markAsRead={markAsRead}
          getPriorityBadge={getPriorityBadge}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          emptyComponent={<AnnouncementEmptyUnread />}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isAdmin={currentUserId === "00000000-0000-0000-0000-000000000001"}
        />
      </TabsContent>

      <TabsContent value="urgent" className="space-y-4 mt-4">
        <AnnouncementList
          announcements={urgentAnnouncements}
          loading={loading}
          isRead={isRead}
          markAsRead={markAsRead}
          getPriorityBadge={getPriorityBadge}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          emptyComponent={<AnnouncementEmptyUrgent />}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isAdmin={currentUserId === "00000000-0000-0000-0000-000000000001"}
        />
      </TabsContent>
    </Tabs>
  );
};
