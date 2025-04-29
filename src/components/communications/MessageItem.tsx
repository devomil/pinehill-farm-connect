
import React from "react";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageStatus } from "./MessageStatus";
import { MessageResponseButtons } from "./MessageResponseButtons";
import { User } from "@/types";
import { MessageItemProps } from "@/types/communications/messageTypes";

export function MessageItem({ 
  message, 
  onRespond, 
  recipient,
  isOutgoing,
  onViewConversation
}: MessageItemProps) {
  const shiftRequest = message.shift_coverage_requests?.[0];

  return (
    <div
      className={`p-4 border rounded-md ${
        !isOutgoing ? "bg-blue-50" : ""
      }`}
    >
      <div className="flex justify-between mb-2">
        <div className="font-medium">
          {!isOutgoing
            ? `From: ${recipient.name}`
            : `To: ${recipient.name}`}
        </div>
        <div className="text-sm text-muted-foreground">
          {format(new Date(message.created_at), "MMM d, h:mm a")}
        </div>
      </div>

      <p className="mb-2">{message.message}</p>

      {message.type === "shift_coverage" && shiftRequest && (
        <div className="bg-muted/30 p-3 rounded-md text-sm mb-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Date:</span>{" "}
              {shiftRequest.shift_date}
            </div>
            <div>
              <span className="font-medium">Time:</span>{" "}
              {shiftRequest.shift_start} - {shiftRequest.shift_end}
            </div>
          </div>
        </div>
      )}

      <MessageStatus 
        status={message.status} 
        type={message.type} 
        shiftRequest={shiftRequest} 
      />
      
      <div className="flex justify-between items-center mt-4">
        <MessageResponseButtons message={message} onRespond={onRespond} />
        
        {onViewConversation && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto"
            onClick={onViewConversation}
          >
            View Conversation 
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
