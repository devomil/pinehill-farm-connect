
import React, { useState, useCallback, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AnnouncementList } from "./AnnouncementList";
import { Announcement } from "@/types";
import { AnnouncementFilters } from "./AnnouncementFilters";
import { DateRange } from "react-day-picker";
import { isAfter, isBefore, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface CommunicationTabsProps {
  announcements: Announcement[];
  loading: boolean;
  isRead: (a: Announcement) => boolean;
  markAsRead: (id: string) => Promise<void>;
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
  currentUserId,
  onEdit,
  onDelete,
  isAdmin,
  onAttachmentAction,
  onAcknowledge,
}) => {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const ITEMS_PER_PAGE = 5;

  // Filter announcements based on active tab, search query, priority, and date range
  const filteredAnnouncements = useCallback(() => {
    console.log(`Filtering announcements for tab: ${activeTab}, with ${announcements.length} total announcements`);
    
    let filtered = [...announcements];
    
    // Filter by tab
    if (activeTab === "unread") {
      filtered = filtered.filter((a) => !isRead(a));
      console.log("After unread filter:", filtered.length);
    } else if (activeTab === "important") {
      filtered = filtered.filter((a) => a.priority === "urgent" || a.priority === "important");
      console.log("After important filter:", filtered.length);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) => a.title.toLowerCase().includes(query) || a.content.toLowerCase().includes(query)
      );
    }
    
    // Filter by priority
    if (selectedPriority !== "all") {
      filtered = filtered.filter((a) => a.priority === selectedPriority);
    }
    
    // Filter by date range
    if (dateRange && dateRange.from) {
      filtered = filtered.filter((a) => {
        const announcementDate = parseISO(a.createdAt.toString());
        if (dateRange.from && isBefore(announcementDate, dateRange.from)) {
          return false;
        }
        if (dateRange.to && isAfter(announcementDate, dateRange.to)) {
          return false;
        }
        return true;
      });
    }
    
    return filtered;
  }, [announcements, activeTab, searchQuery, selectedPriority, dateRange, isRead]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedPriority, dateRange]);

  // Pagination logic
  const paginatedAnnouncements = useCallback(() => {
    const filtered = filteredAnnouncements();
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    
    console.log(`Returning ${filtered.slice(start, end).length} announcements for page ${currentPage} of ${Math.ceil(filtered.length / ITEMS_PER_PAGE)}`);
    
    return filtered.slice(start, end);
  }, [filteredAnnouncements, currentPage]);

  const totalPages = Math.ceil(filteredAnnouncements().length / ITEMS_PER_PAGE);
  
  // Calculate unread count for badge
  const unreadCount = announcements.filter(a => !isRead(a)).length;
  
  console.log("CommunicationTabs rendered with", announcements.length, "announcements");

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
          <TabsTrigger value="all">All Announcements</TabsTrigger>
          <TabsTrigger value="unread" className="relative">
            Unread
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="important">Important</TabsTrigger>
        </TabsList>
        
        <AnnouncementFilters 
          onSearchChange={setSearchQuery}
          onPriorityChange={setSelectedPriority}
          onDateRangeChange={setDateRange}
        />

        <TabsContent value="all" className="mt-6">
          <AnnouncementList
            announcements={paginatedAnnouncements()}
            loading={loading}
            isRead={isRead}
            markAsRead={markAsRead}
            getPriorityBadge={getPriorityBadge}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onEdit={onEdit}
            onDelete={onDelete}
            isAdmin={isAdmin}
            onAttachmentAction={onAttachmentAction}
            onAcknowledge={onAcknowledge}
          />
        </TabsContent>
        
        <TabsContent value="unread" className="mt-6">
          <AnnouncementList
            announcements={paginatedAnnouncements()}
            loading={loading}
            isRead={isRead}
            markAsRead={markAsRead}
            getPriorityBadge={getPriorityBadge}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onEdit={onEdit}
            onDelete={onDelete}
            isAdmin={isAdmin}
            onAttachmentAction={onAttachmentAction}
            onAcknowledge={onAcknowledge}
          />
        </TabsContent>
        
        <TabsContent value="important" className="mt-6">
          <AnnouncementList
            announcements={paginatedAnnouncements()}
            loading={loading}
            isRead={isRead}
            markAsRead={markAsRead}
            getPriorityBadge={getPriorityBadge}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onEdit={onEdit}
            onDelete={onDelete}
            isAdmin={isAdmin}
            onAttachmentAction={onAttachmentAction}
            onAcknowledge={onAcknowledge}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
