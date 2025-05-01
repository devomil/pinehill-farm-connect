
import React from "react";
import { format } from "date-fns";
import { Communication } from "@/types/communications/communicationTypes";

interface MessageBubbleProps {
  message: Communication;
  isMine: boolean;
}

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  const hasShiftDetails = message.shift_coverage_requests && message.shift_coverage_requests.length > 0;
  const shiftRequest = hasShiftDetails ? message.shift_coverage_requests[0] : null;
  
  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] ${
          isMine
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        } rounded-lg p-3`}
      >
        <p className="whitespace-pre-wrap break-words">{message.message}</p>
        
        {hasShiftDetails && shiftRequest && (
          <div className="mt-2 p-2 bg-background/60 rounded text-sm">
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
