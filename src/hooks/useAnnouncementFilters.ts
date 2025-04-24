
import { useState } from "react";
import { Announcement } from "@/types";
import { DateRange } from "react-day-picker";

export const useAnnouncementFilters = (announcements: Announcement[]) => {
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
      filtered = filtered.filter(a => !a.readBy.includes(a.currentUserId || ''));
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

    return {
      announcements: filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  };

  return {
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
  };
};
