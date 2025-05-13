
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useCommunications } from "@/hooks/useCommunications";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Megaphone, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { isAnnouncementReadByUser } from "@/utils/announcementUtils";
import { useLocation } from "react-router-dom";
import { useRefreshMessages } from "@/hooks/communications/useRefreshMessages";

export const CommunicationIndicators: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { announcements, refetchData } = useDashboardData();
  const { unreadMessages, refreshMessages } = useCommunications();
  const location = useLocation();
  const manualRefresh = useRefreshMessages();
  
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

  // Handle navigation to communication pages
  const handleAnnouncementsClick = () => {
    navigate("/communication");
  };
  
  const handleMessagesClick = () => {
    navigate("/communication?tab=messages");
    // Force immediate refresh when clicking on messages
    setTimeout(() => manualRefresh(), 200);
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
              <Megaphone className="h-5 w-5 mr-3" />
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
              <MessageSquare className="h-5 w-5 mr-3" />
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
