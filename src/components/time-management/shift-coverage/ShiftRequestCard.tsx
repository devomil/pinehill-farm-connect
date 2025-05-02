
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
  onRespond,
}) => {
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);

  // We need to ensure the component has the necessary shift coverage request data
  useEffect(() => {
    if (!request.shift_coverage_requests || request.shift_coverage_requests.length === 0) {
      console.warn("ShiftRequestCard received a request without shift_coverage_requests data:", request.id);
    }
  }, [request]);

  if (!request.shift_coverage_requests || request.shift_coverage_requests.length === 0) {
    return null;
  }

  const shiftRequest = request.shift_coverage_requests[0];
  const requesterEmployee = findEmployee(shiftRequest.original_employee_id);
  const coveringEmployee = findEmployee(shiftRequest.covering_employee_id);
  
  const requesterName = requesterEmployee?.name || "Unknown Employee";
  const coveringName = coveringEmployee?.name || "Unknown Employee";

  // Determine if this user is involved directly
  const isRequester = shiftRequest.original_employee_id === currentUser.id;
  const isCovering = shiftRequest.covering_employee_id === currentUser.id;
  
  // Create formatted date and time strings
  const shiftDate = shiftRequest.shift_date;
  const formattedDate = shiftRequest.shift_date;
  const shiftTimeRange = `${shiftRequest.shift_start} - ${shiftRequest.shift_end}`;

  // Format created date
  const createdDate = format(new Date(request.created_at), "MMM dd, yyyy");

  const handleRespond = (accept: boolean) => {
    onRespond({
      communicationId: request.id,
      shiftRequestId: shiftRequest.id,
      accept,
      senderId: request.sender_id,
    });
  };

  const getBadgeColor = () => {
    switch (shiftRequest.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = () => {
    switch (shiftRequest.status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      default:
        return 'Unknown';
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-medium">
              {isRequester 
                ? `You requested ${coveringName} to cover your shift`
                : isCovering
                  ? `${requesterName} requested you to cover their shift`
                  : `${requesterName} requested ${coveringName} to cover their shift`}
            </CardTitle>
            <Badge className={`${getBadgeColor()}`}>
              {getStatusText()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2" />
                <span>{shiftTimeRange}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Requested on {createdDate}
              </p>
            </div>
            
            {shiftRequest.status === 'pending' && isCovering && (
              <div className="flex justify-end items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeclineDialog(true)}
                  className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                >
                  <X className="h-4 w-4 mr-1" /> 
                  Decline
                </Button>
                <Button 
                  onClick={() => setShowAcceptDialog(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" /> 
                  Accept
                </Button>
              </div>
            )}
            
            {shiftRequest.status === 'accepted' && (
              <div className="flex justify-end">
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <Check className="h-3 w-3 mr-1" /> Accepted
                </Badge>
              </div>
            )}
            
            {shiftRequest.status === 'declined' && (
              <div className="flex justify-end">
                <Badge className="bg-red-100 text-red-800 border-red-300">
                  <X className="h-3 w-3 mr-1" /> Declined
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ShiftResponseConfirmDialog
        isOpen={showAcceptDialog}
        onClose={() => setShowAcceptDialog(false)}
        onConfirm={() => {
          handleRespond(true);
          setShowAcceptDialog(false);
        }}
        isAccepting={true}
        requesterName={requesterName}
        shiftDate={formattedDate}
        shiftTime={shiftTimeRange}
      />

      <ShiftResponseConfirmDialog
        isOpen={showDeclineDialog}
        onClose={() => setShowDeclineDialog(false)}
        onConfirm={() => {
          handleRespond(false);
          setShowDeclineDialog(false);
        }}
        isAccepting={false}
        requesterName={requesterName}
        shiftDate={formattedDate}
        shiftTime={shiftTimeRange}
      />
    </>
  );
};
