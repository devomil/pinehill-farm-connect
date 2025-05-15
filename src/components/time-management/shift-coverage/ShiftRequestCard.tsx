
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { format } from "date-fns";
import { useShiftCoverageHandler } from "@/hooks/workSchedule";
import { toast } from "@/hooks/use-toast";

interface ShiftRequestCardProps {
  message: Communication;
  onRespond: (data: {
    communicationId: string;
    shiftRequestId: string;
    accept: boolean;
    senderId: string;
  }) => void;
  currentUser: User;
}

export const ShiftRequestCard: React.FC<ShiftRequestCardProps> = ({
  message,
  onRespond,
  currentUser
}) => {
  // Extract shift details if they exist
  const shiftRequest = message.shift_coverage_requests?.[0];
  const { handleShiftTransfer, processing } = useShiftCoverageHandler(currentUser);
  
  if (!shiftRequest) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Invalid shift request data</p>
        </CardContent>
      </Card>
    );
  }
  
  const isPending = message.status === 'pending';
  const isOriginalEmployee = currentUser.id === shiftRequest.original_employee_id;
  const isCoveringEmployee = currentUser.id === shiftRequest.covering_employee_id;
  
  const handleAccept = async () => {
    // First handle the shift transfer between employees
    if (shiftRequest.original_employee_id && shiftRequest.covering_employee_id) {
      const success = await handleShiftTransfer(
        shiftRequest.original_employee_id,
        shiftRequest.covering_employee_id,
        shiftRequest.shift_date,
        shiftRequest.shift_start,
        shiftRequest.shift_end
      );
      
      if (success) {
        // Then update the communication status
        onRespond({
          communicationId: message.id,
          shiftRequestId: shiftRequest.id,
          accept: true,
          senderId: message.sender_id
        });
        
        toast({
          description: "Shift successfully transferred",
          variant: "success"
        });
      }
    } else {
      // Fallback if we don't have all the data
      onRespond({
        communicationId: message.id,
        shiftRequestId: shiftRequest.id,
        accept: true,
        senderId: message.sender_id
      });
    }
  };
  
  const handleDecline = () => {
    onRespond({
      communicationId: message.id,
      shiftRequestId: shiftRequest.id,
      accept: false,
      senderId: message.sender_id
    });
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Shift Coverage Request</h3>
            <p className="text-sm text-muted-foreground">
              From: {message.sender_name || 'Unknown'}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm"><span className="font-medium">Date:</span> {shiftRequest.shift_date ? format(new Date(shiftRequest.shift_date), 'PPP') : 'Not specified'}</p>
            <p className="text-sm"><span className="font-medium">Time:</span> {shiftRequest.shift_start} to {shiftRequest.shift_end}</p>
            <p className="text-sm"><span className="font-medium">Message:</span> {message.message}</p>
            <p className="text-sm"><span className="font-medium">Status:</span> {message.status.charAt(0).toUpperCase() + message.status.slice(1)}</p>
          </div>
          
          {isPending && isCoveringEmployee && (
            <div className="flex space-x-2">
              <Button onClick={handleAccept} disabled={processing}>Accept</Button>
              <Button variant="outline" onClick={handleDecline} disabled={processing}>Decline</Button>
            </div>
          )}
          
          {!isPending && (
            <p className="text-sm font-medium text-muted-foreground">
              This request has been {message.status}.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
