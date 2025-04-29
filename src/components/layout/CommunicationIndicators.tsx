
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useCommunications } from "@/hooks/useCommunications";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Megaphone, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

export const CommunicationIndicators: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { announcements } = useDashboardData();
  const { unreadMessages } = useCommunications();
  
  // Count unread announcements - check if the announcement is unread (implementation depends on your data structure)
  // Since we don't have read_by and user_id properties, we'll need to adjust this logic
  const unreadAnnouncements = announcements?.filter(a => {
    // This is a simplified check. Adjust based on how you track read status
    // For example, if you have a separate table or field to track read status
    return !a.requires_acknowledgment;  // Just an example, replace with actual logic
  }).length || 0;
  
  // Count of unread direct messages (from useCommunications hook)
  const unreadMessageCount = unreadMessages?.length || 0;
  
  const hasUnread = unreadAnnouncements > 0 || unreadMessageCount > 0;

  return (
    <div className="fixed top-4 right-6 z-10 flex items-center space-x-2">
      <TooltipProvider>
        {/* Removed the "New" combined notifications button */}
        
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
