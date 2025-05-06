
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Communication } from "@/types/communications/communicationTypes";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MessageBubbleProps {
  message: Communication;
  isMine: boolean;
}

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  // Format time to show in the message
  const formatMessageTime = (dateString: string) => {
    // For recent messages, show relative time
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      return "Just now";
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    } else if (diffMins < 24 * 60) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      // For older messages, show the actual time
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
             ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const isUnread = !isMine && !message.read_at;
  const isUrgent = message.type === "urgent";

  return (
    <div
      className={`flex flex-col ${
        isMine ? "items-end" : "items-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 text-sm ${
          isMine
            ? "bg-primary text-primary-foreground"
            : isUnread
            ? "bg-blue-50 border border-blue-200"
            : "bg-muted"
        } ${isUrgent ? "border-l-4 border-red-500" : ""}`}
      >
        {isUrgent && (
          <div className="flex items-center mb-1">
            <Badge variant="destructive" className="mb-1">
              <AlertCircle className="h-3 w-3 mr-1" /> Urgent
            </Badge>
          </div>
        )}
        
        <div className="whitespace-pre-line">{message.message}</div>
        
        <div className="flex items-center justify-end mt-1 text-xs opacity-70">
          {formatMessageTime(message.created_at)}
          {isMine && message.read_at && (
            <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
          )}
        </div>
      </div>
      
      {isUnread && (
        <div className="mt-1 text-xs text-blue-600 font-medium flex items-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full mr-1.5"></div>
          New Message
        </div>
      )}
    </div>
  );
}
