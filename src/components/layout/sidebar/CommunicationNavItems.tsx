
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Megaphone, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useCommunications } from "@/hooks/useCommunications";
import { isAnnouncementReadByUser } from "@/utils/announcementUtils";
import { useRefreshMessages } from "@/hooks/communications/useRefreshMessages";

interface NavItemProps {
  collapsed: boolean;
}

export const CommunicationNavItems = ({ collapsed }: NavItemProps) => {
  const { pathname, search } = useLocation();
  const { currentUser } = useAuth();
  const { unreadMessages, refreshMessages } = useCommunications();
  const { announcements, refetchData } = useDashboardData();
  
  // Add effect to refresh unread messages when navigating to communications
  useEffect(() => {
    if (pathname.includes('/communication')) {
      console.log("On communication page, refreshing message data");
      refreshMessages();
      refetchData();
      
      // Additional refresh for messages tab to ensure badge counts are accurate
      if (search.includes('tab=messages')) {
        // Secondary refresh after a slight delay to catch any updates
        setTimeout(() => refreshMessages(), 1000);
      }
    }
  }, [pathname, search, refreshMessages, refetchData]);
  
  // Count unread messages - explicitly only count direct message types
  const unreadMessageCount = unreadMessages?.filter(
    msg => msg.type === 'general' || msg.type === 'shift_coverage' || msg.type === 'urgent'
  ).length || 0;
  
  // Count unread announcements - exclude those requiring acknowledgment and those already read
  const unreadAnnouncementCount = announcements
    ? announcements.filter(a => {
        return !isAnnouncementReadByUser(a, currentUser?.id) && 
          !a.requires_acknowledgment;
      }).length
    : 0;
    
  const communicationItems = [
    {
      to: "/communication",
      icon: <Megaphone className="h-5 w-5 mr-3" />,
      label: "Announcements",
      showIf: true,
      badge: unreadAnnouncementCount > 0 ? (
        <Badge className="ml-auto">{unreadAnnouncementCount}</Badge>
      ) : null,
    },
    {
      to: "/communication?tab=messages",
      icon: <MessageSquare className="h-5 w-5 mr-3" />,
      label: "Messages",
      showIf: true,
      badge: unreadMessageCount > 0 ? (
        <Badge variant="destructive" className="ml-auto">{unreadMessageCount}</Badge>
      ) : null,
    }
  ];

  return (
    <div className="flex flex-col gap-1">
      {communicationItems.map(item => 
        item.showIf && (
          <Button
            key={item.to}
            variant={item.badge !== null ? "default" : "ghost"}
            className={cn(
              "justify-start font-normal",
              (pathname === item.to || pathname === "/communications" || 
               (pathname.includes('/communication') && item.to.includes(pathname.includes('?tab=messages') ? 'messages' : 'communication'))) 
              && "bg-accent"
            )}
            asChild
          >
            <Link to={item.to} className="flex w-full items-center">
              {item.icon}
              <span className={!collapsed ? "block" : "hidden"}>{item.label}</span>
              {!collapsed && item.badge}
              {collapsed && item.badge && (
                <Badge 
                  variant={item.to.includes("messages") ? "destructive" : "default"} 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                >
                  {item.to.includes("messages") ? unreadMessageCount : unreadAnnouncementCount}
                </Badge>
              )}
            </Link>
          </Button>
        )
      )}
    </div>
  );
};
