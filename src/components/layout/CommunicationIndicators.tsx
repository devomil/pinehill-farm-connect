
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useCommunications } from "@/hooks/useCommunications";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { isAnnouncementReadByUser } from "@/utils/announcementUtils";
import { useLocation } from "react-router-dom";
import { useRefreshMessages } from "@/hooks/communications/useRefreshMessages";
import { communicationNavItems } from "@/config/navConfig";

export const CommunicationIndicators: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { announcements, refetchData } = useDashboardData();
  const { unreadMessages, refreshMessages } = useCommunications();
  const location = useLocation();
  const { refresh: manualRefresh } = useRefreshMessages();
  
  // Count unread announcements - exclude those requiring acknowledgment
  const unreadAnnouncements = announcements
    ? announcements.filter(a => {
        return !isAnnouncementReadByUser(a, currentUser?.id) && 
          !a.requires_acknowledgment;
      }).length
    : 0;
  
  // Count of unread direct messages - explicitly only count unread direct message types sent to current user
  const unreadMessageCount = unreadMessages?.filter(
    msg => (msg.type === 'general' || msg.type === 'shift_coverage' || msg.type === 'urgent') &&
           msg.recipient_id === currentUser?.id &&
           msg.read_at === null
  ).length || 0;

  // Admin users need more frequent refreshes to keep badges accurate
  const isAdmin = currentUser?.role === 'admin';

  // Refresh data when on dashboard to ensure badges are updated
  useEffect(() => {
    // Initial refresh when component mounts
    refreshMessages();
    refetchData();
    
    // Set up automatic refresh interval - more frequent for admins
    const refreshInterval = setInterval(() => {
      console.log("Auto-refreshing communications indicators");
      refreshMessages();
      refetchData();
    }, isAdmin ? 20000 : 30000); // 20s for admins, 30s for regular users
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [refreshMessages, refetchData, isAdmin]);

  // Additional effect to refresh when returning to dashboard
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      console.log("Returned to dashboard, refreshing message indicators");
      manualRefresh();
      refetchData();
    }
  }, [location.pathname, manualRefresh, refetchData]);

  // Find the communication items from our centralized config
  const announcementItem = communicationNavItems.find(item => item.id === "announcements");
  const messagesItem = communicationNavItems.find(item => item.id === "messages");

  // Handle navigation to communication pages with debug logging
  const handleAnnouncementsClick = () => {
    console.log("Navigating to announcements tab");
    // Use replace: true to avoid creating excessive history entries
    navigate("/communication", { replace: true });
  };
  
  const handleMessagesClick = () => {
    console.log("Navigating to messages tab");
    // Use replace: true for consistent behavior with TabNavigation
    navigate("/communication?tab=messages", { replace: true });
    
    // Force immediate refresh when clicking on messages, but with a delay
    setTimeout(() => {
      console.log("Post-navigation refresh for messages tab");
      manualRefresh();
    }, 300);
  };

  return (
    <div className="flex flex-col space-y-2 mb-4">
      <TooltipProvider>
        {/* Announcements */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleAnnouncementsClick}
              className="relative w-full justify-start"
            >
              {announcementItem?.icon}
              <span>Announcements</span>
              {unreadAnnouncements > 0 && (
                <Badge className="ml-auto h-5 w-5 p-0 flex items-center justify-center">
                  {unreadAnnouncements}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Company Announcements</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Direct Messages */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={unreadMessageCount > 0 ? "default" : "ghost"}
              size="sm"
              onClick={handleMessagesClick}
              className="relative w-full justify-start"
            >
              {messagesItem?.icon}
              <span>Messages</span>
              {unreadMessageCount > 0 && (
                <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 flex items-center justify-center">
                  {unreadMessageCount}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Direct Messages {unreadMessageCount > 0 ? `(${unreadMessageCount} unread)` : ''}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
