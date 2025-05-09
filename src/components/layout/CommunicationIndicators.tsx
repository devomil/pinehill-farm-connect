
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

export const CommunicationIndicators: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { announcements, refetchData } = useDashboardData();
  const { unreadMessages, refreshMessages } = useCommunications();
  const location = useLocation();
  
  // Count unread announcements - exclude those requiring acknowledgment
  const unreadAnnouncements = announcements
    ? announcements.filter(a => {
        return !isAnnouncementReadByUser(a, currentUser?.id) && 
          !a.requires_acknowledgment;
      }).length
    : 0;
  
  // Count of unread direct messages (from useCommunications hook)
  const unreadMessageCount = unreadMessages?.length || 0;

  // Refresh data when on communications page to ensure badges are updated
  useEffect(() => {
    if (location.pathname === '/communication') {
      refreshMessages();
      refetchData();
    }
  }, [location.pathname, refreshMessages, refetchData]);

  return (
    <div className="flex flex-col space-y-2 mb-4">
      <TooltipProvider>
        {/* Announcements */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/communication")}
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
              onClick={() => navigate("/communication?tab=messages")}
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
            <p>Direct Messages ({unreadMessageCount} unread)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
