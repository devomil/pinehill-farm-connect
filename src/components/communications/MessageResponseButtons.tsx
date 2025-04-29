
import React from "react";
import { Button } from "@/components/ui/button";

interface MessageResponseButtonsProps {
  message: any;
  onRespond: (data: { communicationId: string; shiftRequestId: string; accept: boolean; senderId: string }) => void;
}

export function MessageResponseButtons({ message, onRespond }: MessageResponseButtonsProps) {
  // Only show response buttons for shift coverage requests directed at the current user
  // that are still pending
  if (
    message.type === "shift_coverage" &&
    message.status === "pending" &&
    message.recipient_id === message.current_user_id
  ) {
    const shiftRequest = message.shift_coverage_requests?.[0];
    if (!shiftRequest) return null;

    return (
      <div className="flex gap-2 mt-4">
        <Button
          variant="default"
          size="sm"
          onClick={() => onRespond({
            communicationId: message.id,
            shiftRequestId: shiftRequest.id,
            accept: true,
            senderId: message.sender_id
          })}
        >
          Accept
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRespond({
            communicationId: message.id,
            shiftRequestId: shiftRequest.id,
            accept: false,
            senderId: message.sender_id
          })}
        >
          Decline
        </Button>
      </div>
    );
  }
  return null;
}
