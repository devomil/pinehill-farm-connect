
import { useState, useEffect } from "react";
import { Announcement } from "@/types";
import { DateRange } from "react-day-picker";

export const useAnnouncementFilters = (announcements: Announcement[]) => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const itemsPerPage = 10;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, priorityFilter, dateRange, activeTab]);

  const filterAnnouncements = (tabType: string) => {
    console.log(`Filtering announcements for tab: ${tabType}, with ${announcements.length} total announcements`);
    
    let filtered = [...announcements];

    // Apply tab filter
    if (tabType === "unread") {
      filtered = filtered.filter(a => !a.readBy.includes(a.currentUserId || ''));
      console.log("After unread filter:", filtered.length);
    } else if (tabType === "important") {
      filtered = filtered.filter(a => a.priority === "important" || a.priority === "urgent");
      console.log("After important filter:", filtered.length);
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
      console.log("After search filter:", filtered.length);
    }

    // Apply priority filter
    if (priorityFilter && priorityFilter !== 'all') {
      filtered = filtered.filter(a => a.priority === priorityFilter);
      console.log("After priority filter:", filtered.length);
    }

    // Apply date range filter
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(a => {
        const announcementDate = new Date(a.createdAt);
        return announcementDate >= fromDate;
      });
      console.log("After from date filter:", filtered.length);
    }

    if (dateRange?.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(a => {
        const announcementDate = new Date(a.createdAt);
        return announcementDate <= toDate;
      });
      console.log("After to date filter:", filtered.length);
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    // Ensure current page is valid
    const safePage = Math.min(currentPage, totalPages);
    
    // Get items for the current page
    const paginatedAnnouncements = filtered.slice(
      (safePage - 1) * itemsPerPage, 
      safePage * itemsPerPage
    );
    
    console.log(`Returning ${paginatedAnnouncements.length} announcements for page ${safePage} of ${totalPages}`);

    return {
      announcements: paginatedAnnouncements,
      totalPages: totalPages
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
