
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";
import { MessageStatus } from "./MessageStatus";
import { MessageCircle, ArrowRight, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MessageItemProps {
  message: Communication;
  recipient: User;
  isOutgoing: boolean;
  isUnread?: boolean;
  onRespond: (data: {
    communicationId: string;
    shiftRequestId: string;
    accept: boolean;
    senderId: string;
  }) => void;
  onViewConversation?: () => void;
}

export function MessageItem({
  message,
  recipient,
  isOutgoing,
  isUnread = false,
  onRespond,
  onViewConversation,
}: MessageItemProps) {
  const shiftCoverage = message.shift_coverage_requests?.[0];
  const hasShiftCoverage = message.type === 'shift_coverage' && shiftCoverage;

  // Format message date in a friendly way
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isToday = date >= today;
    const isYesterday = date >= yesterday && date < today;

    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isYesterday) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
             ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  // Format shift time for display
  const formatShiftTime = (date: string, time: string) => {
    const shiftDate = new Date(date);
    return `${shiftDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at ${time}`;
  };

  const getCardClasses = () => {
    let classes = "transition-colors ";
    
    if (isUnread) {
      classes += "border-l-4 border-primary bg-primary/5 ";
    }
    
    if (message.type === "urgent") {
      classes += "border-red-300 bg-red-50 ";
    } else if (hasShiftCoverage) {
      classes += isOutgoing ? "" : "border border-blue-200 ";
    }
    
    return classes;
  };

  return (
    <Card className={getCardClasses()}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary mr-3">
              <UserIcon className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">
                {isOutgoing ? `To: ${recipient.name}` : `From: ${recipient.name}`}
                {isUnread && (
                  <Badge className="ml-2 bg-primary/20 text-primary border-primary/30" variant="outline">
                    <MessageCircle className="h-3 w-3 mr-1" /> New
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatMessageDate(message.created_at)}
              </div>
            </div>
          </div>
          {message.type !== "general" && (
            <Badge variant={message.type === "urgent" ? "destructive" : "secondary"}>
              {message.type === "shift_coverage" ? "Shift Coverage" : "Urgent"}
            </Badge>
          )}
        </div>

        <div className="text-sm mb-3 whitespace-pre-line">{message.message}</div>

        {hasShiftCoverage && (
          <div className="bg-muted/50 p-3 rounded-md text-sm mb-3">
            <p className="font-medium mb-1">Shift Coverage Request</p>
            <p>
              {formatShiftTime(shiftCoverage.shift_date, shiftCoverage.shift_start)}{" "}
              - {shiftCoverage.shift_end}
            </p>
            <div className="mt-1">
              <MessageStatus status={message.status} />
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          {hasShiftCoverage && !isOutgoing && message.status === "pending" && (
            <div className="space-x-2">
              <Button
                size="sm"
                variant="default"
                onClick={() =>
                  onRespond({
                    communicationId: message.id,
                    shiftRequestId: shiftCoverage.id,
                    accept: true,
                    senderId: message.sender_id,
                  })
                }
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onRespond({
                    communicationId: message.id,
                    shiftRequestId: shiftCoverage.id,
                    accept: false,
                    senderId: message.sender_id,
                  })
                }
              >
                Decline
              </Button>
            </div>
          )}

          {(!hasShiftCoverage || message.status !== "pending" || isOutgoing) && (
            <div></div>
          )}

          <Button size="sm" variant="ghost" onClick={onViewConversation}>
            View Conversation <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
