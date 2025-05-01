
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Check, X } from "lucide-react";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { format } from "date-fns";
import { ShiftResponseConfirmDialog } from "./ShiftResponseConfirmDialog";

interface ShiftRequestCardProps {
  request: Communication;
  currentUser: User;
  findEmployee: (id: string) => User | undefined;
  onRespond: (data: {
    communicationId: string;
    shiftRequestId: string;
    accept: boolean;
    senderId: string;
  }) => void;
}

export const ShiftRequestCard: React.FC<ShiftRequestCardProps> = ({
  request,
  currentUser,
  findEmployee,
  onRespond
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [responseType, setResponseType] = useState<boolean | null>(null);
  
  const isIncoming = request.recipient_id === currentUser.id;
  const otherPersonId = isIncoming ? request.sender_id : request.recipient_id;
  const otherPerson = findEmployee(otherPersonId);
  const shiftDetails = request.shift_coverage_requests?.[0];
  
  // Debug logging for the card component
  useEffect(() => {
    console.log(`Rendering ShiftRequestCard for request ${request.id}:`, {
      isIncoming,
      otherPersonId,
      otherPerson: otherPerson?.name || 'Unknown',
      shiftDetails: shiftDetails ? {
        id: shiftDetails.id,
        date: shiftDetails.shift_date,
        start: shiftDetails.shift_start,
        end: shiftDetails.shift_end,
        status: shiftDetails.status
      } : 'No shift details'
    });
  }, [request, isIncoming, otherPersonId, otherPerson, shiftDetails]);
  
  // IMPORTANT: Use the status from the shift request, not the communication
  const requestStatus = shiftDetails?.status || 'pending';
  const isStatusPending = requestStatus === 'pending';
  
  console.log(`ShiftRequestCard ${request.id} status: ${requestStatus}, isStatusPending: ${isStatusPending}`);
  
  // Determine color scheme based on status
  const statusColors = {
    pending: {
      badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
      card: "border-yellow-200"
    },
    accepted: {
      badge: "bg-green-100 text-green-800 border-green-200",
      card: "border-green-200"
    },
    declined: {
      badge: "bg-red-100 text-red-800 border-red-200",
      card: "border-red-200"
    }
  };
  
  const colors = statusColors[requestStatus as keyof typeof statusColors] || statusColors.pending;

  const handleResponseClick = (accept: boolean) => {
    setResponseType(accept);
    setShowConfirmDialog(true);
  };

  const handleConfirmResponse = () => {
    if (responseType !== null && shiftDetails) {
      console.log("Confirming response to shift request:", {
        communicationId: request.id,
        shiftRequestId: shiftDetails.id,
        accept: responseType,
        senderId: request.sender_id
      });
      
      onRespond({
        communicationId: request.id,
        shiftRequestId: shiftDetails.id,
        accept: responseType,
        senderId: request.sender_id
      });
    }
    setShowConfirmDialog(false);
  };

  if (!shiftDetails) {
    console.warn(`ShiftRequestCard ${request.id} has no shift details`);
    return null;
  }

  return (
    <>
      <Card className={`overflow-hidden ${colors.card}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              {isIncoming ? "Shift Coverage Request" : "Your Coverage Request"}
            </CardTitle>
            <Badge variant="outline" className={colors.badge}>
              {requestStatus.charAt(0).toUpperCase() + requestStatus.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">
                {isIncoming ? "Requested by" : "Requested from"}:
              </h4>
              <p>{otherPerson?.name || "Unknown"}</p>
            </div>
            
            <div className="bg-muted/40 p-4 rounded-md space-y-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">Date: </span>
                <span className="ml-2">{shiftDetails.shift_date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">Time: </span>
                <span className="ml-2">{shiftDetails.shift_start} - {shiftDetails.shift_end}</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Message:</h4>
              <p>{request.message}</p>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Sent on {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
            </div>
            
            {isIncoming && isStatusPending && (
              <div className="flex space-x-2 pt-2">
                <Button
                  onClick={() => handleResponseClick(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-4 w-4" /> Accept
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleResponseClick(false)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="mr-2 h-4 w-4" /> Decline
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ShiftResponseConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmResponse}
        isAccepting={responseType === true}
        requesterName={otherPerson?.name || "Unknown"}
        shiftDate={shiftDetails.shift_date}
        shiftTime={`${shiftDetails.shift_start} - ${shiftDetails.shift_end}`}
      />
    </>
  );
};
