
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
  const unreadAnnouncements = announcements.filter(a => !isRead(a));
  const urgentAnnouncements = announcements.filter(a => a.priority === "urgent");

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
      <TabsContent value="all" className="space-y-4 mt-4">
        {loading ? (
          <AnnouncementLoading />
        ) : announcements.length === 0 ? (
          <AnnouncementEmptyAll />
        ) : (
          announcements.map(announcement => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isRead={isRead(announcement)}
              onMarkAsRead={() => markAsRead(announcement.id)}
              showMarkAsRead={true}
              getPriorityBadge={getPriorityBadge}
            />
          ))
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

