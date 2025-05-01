
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShiftResponseConfirmDialog } from "@/components/time-management/shift-coverage/ShiftResponseConfirmDialog";
import { Check, X } from "lucide-react";

interface MessageResponseButtonsProps {
  message: any;
  onRespond: (data: { communicationId: string; shiftRequestId: string; accept: boolean; senderId: string }) => void;
}

export function MessageResponseButtons({ message, onRespond }: MessageResponseButtonsProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [responseType, setResponseType] = useState<boolean | null>(null);
  
  // Only show response buttons for shift coverage requests directed at the current user
  // that are still pending
  if (
    message.type === "shift_coverage" &&
    message.status === "pending" &&
    message.recipient_id === message.current_user_id
  ) {
    const shiftRequest = message.shift_coverage_requests?.[0];
    if (!shiftRequest) return null;

    const handleResponseClick = (accept: boolean) => {
      setResponseType(accept);
      setShowConfirmDialog(true);
    };

    const handleConfirmResponse = () => {
      if (responseType !== null) {
        onRespond({
          communicationId: message.id,
          shiftRequestId: shiftRequest.id,
          accept: responseType,
          senderId: message.sender_id
        });
      }
      setShowConfirmDialog(false);
    };

    // Try to find sender name from message data if available
    const senderName = message.sender_name || "colleague";
    
    return (
      <>
        <div className="flex gap-2 mt-4">
          <Button
            variant="default"
            size="sm"
            onClick={() => handleResponseClick(true)}
          >
            <Check className="mr-1 h-3 w-3" /> Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleResponseClick(false)}
          >
            <X className="mr-1 h-3 w-3" /> Decline
          </Button>
        </div>

        <ShiftResponseConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmResponse}
          isAccepting={responseType === true}
          requesterName={senderName}
          shiftDate={shiftRequest.shift_date || "the requested date"}
          shiftTime={`${shiftRequest.shift_start || ""} - ${shiftRequest.shift_end || ""}`}
        />
      </>
    );
  }
  return null;
}
