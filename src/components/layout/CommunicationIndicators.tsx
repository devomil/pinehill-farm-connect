
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useCommunications } from "@/hooks/useCommunications";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Megaphone, MessageSquare, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const CommunicationIndicators: React.FC = () => {
  const navigate = useNavigate();
  const { announcements } = useDashboardData();
  const { unreadMessages } = useCommunications();
  
  // Count unread announcements (this is a placeholder, implement based on your data structure)
  const unreadAnnouncements = announcements?.filter(a => !a.read_by?.includes(a.user_id)).length || 0;
  
  // Count of unread direct messages (from useCommunications hook)
  const unreadMessageCount = unreadMessages?.length || 0;
  
  const hasUnread = unreadAnnouncements > 0 || unreadMessageCount > 0;

  return (
    <div className="fixed top-4 right-6 z-10 flex items-center space-x-2">
      <TooltipProvider>
        {/* Main indicator that shows combined notifications */}
        {hasUnread && (
          <div className="mr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(unreadAnnouncements > 0 ? "/communication" : "/communications")}
                  className="relative"
                >
                  <Bell className="h-4 w-4 mr-1" />
                  <span>New</span>
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                    {unreadAnnouncements + unreadMessageCount}
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>You have unread communications</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        
        {/* Announcements */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/communication")}
              className="relative"
            >
              <Megaphone className="h-5 w-5" />
              {unreadAnnouncements > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  {unreadAnnouncements}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Company Announcements</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Direct Messages */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/communications")}
              className="relative"
            >
              <MessageSquare className="h-5 w-5" />
              {unreadMessageCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  {unreadMessageCount}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Direct Messages</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
