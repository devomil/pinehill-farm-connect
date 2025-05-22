
import React from "react";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { Communication } from "@/types/communications/communicationTypes";

interface MessageListHeaderProps {
  unreadCount: number;
}

export function MessageListHeader({ unreadCount }: MessageListHeaderProps) {
  if (unreadCount <= 0) {
    return null;
  }

  return (
    <div className="bg-muted/30 p-3 rounded-md flex items-center justify-between">
      <div className="flex items-center">
        <MessageSquare className="h-4 w-4 mr-2 text-primary" />
        <span className="text-sm font-medium">You have new messages</span>
      </div>
      <Badge variant="default">{unreadCount} unread</Badge>
    </div>
  );
}
