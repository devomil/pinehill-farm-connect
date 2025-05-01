
import React from "react";
import { format } from "date-fns";
import { Communication } from "@/types/communications/communicationTypes";
import { Badge } from "@/components/ui/badge";

interface MessageBubbleProps {
  message: Communication;
  isMine: boolean;
}

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  const hasShiftDetails = message.shift_coverage_requests && message.shift_coverage_requests.length > 0;
  const shiftRequest = hasShiftDetails ? message.shift_coverage_requests[0] : null;
  
  // Determine if this is a high priority message
  const isUrgent = message.type === 'urgent' || message.type === 'shift_coverage';
  
  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] ${
          isMine
            ? isUrgent ? "bg-red-500 text-white" : "bg-primary text-primary-foreground"
            : isUrgent ? "bg-red-100 border-red-300 border" : "bg-muted"
        } rounded-lg p-3`}
      >
        {isUrgent && (
          <div className="mb-2 flex">
            <Badge variant={isMine ? "outline" : "destructive"} className={isMine ? "bg-white/20" : ""}>
              {message.type === 'shift_coverage' ? 'SHIFT COVERAGE REQUEST' : 'URGENT'}
            </Badge>
          </div>
        )}
        
        <p className="whitespace-pre-wrap break-words">{message.message}</p>
        
        {hasShiftDetails && shiftRequest && (
          <div className={`mt-2 p-2 ${isMine ? "bg-red-400/30" : "bg-white/80"} rounded text-sm`}>
            <div className="font-medium mb-1">Shift Coverage Request:</div>
            <div><span className="font-medium">Date:</span> {shiftRequest.shift_date}</div>
            <div><span className="font-medium">Time:</span> {shiftRequest.shift_start} - {shiftRequest.shift_end}</div>
            <div className="mt-1"><span className="font-medium">Status:</span> {message.status}</div>
          </div>
        )}
        
        <div className="text-xs mt-1 opacity-70">
          {format(new Date(message.created_at), "MMM d, h:mm a")}
        </div>
      </div>
    </div>
  );
}
