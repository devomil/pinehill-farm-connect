
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { format } from "date-fns";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { NewShiftCoverageRequestButton } from "./NewShiftCoverageRequestButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ShiftCoverageRequestsTabProps {
  messages: Communication[];
  loading: boolean;
  error?: any;
  onRespond: (data: {
    communicationId: string;
    shiftRequestId: string;
    accept: boolean;
    senderId: string;
  }) => void;
  currentUser: User;
  onRefresh: () => void;
}

export const ShiftCoverageRequestsTab: React.FC<ShiftCoverageRequestsTabProps> = ({
  messages,
  loading,
  error,
  onRespond,
  currentUser,
  onRefresh,
}) => {
  const { unfilteredEmployees: allEmployees, isLoading: employeesLoading } = useEmployeeDirectory();
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');

  // Filter shift coverage requests from messages
  const shiftCoverageRequests = useMemo(() => {
    return messages?.filter(
      (message) => 
        message.type === "shift_coverage" && 
        (message.recipient_id === currentUser.id || 
         message.sender_id === currentUser.id) &&
        message.shift_coverage_requests && 
        message.shift_coverage_requests.length > 0
    ) || [];
  }, [messages, currentUser]);

  // Apply status filter
  const filteredRequests = useMemo(() => {
    if (filter === 'all') {
      return shiftCoverageRequests;
    }
    return shiftCoverageRequests.filter(request => request.status === filter);
  }, [shiftCoverageRequests, filter]);

  const pendingCount = useMemo(() => 
    shiftCoverageRequests.filter(req => req.status === 'pending').length, 
    [shiftCoverageRequests]
  );

  const acceptedCount = useMemo(() => 
    shiftCoverageRequests.filter(req => req.status === 'accepted').length, 
    [shiftCoverageRequests]
  );

  const declinedCount = useMemo(() => 
    shiftCoverageRequests.filter(req => req.status === 'declined').length, 
    [shiftCoverageRequests]
  );

  // Find employee by ID
  const findEmployee = (id: string): User | undefined => {
    return allEmployees?.find(emp => emp.id === id);
  };

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading shift coverage requests</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>There was a problem loading your shift coverage requests. Please try again.</p>
          <Button variant="outline" size="sm" className="w-fit" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-3 w-3" /> Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (loading || employeesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading shift coverage requests...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant={filter === 'all' ? 'default' : 'outline'} 
            onClick={() => setFilter('all')}
          >
            All Requests
          </Button>
          <Button 
            size="sm" 
            variant={filter === 'pending' ? 'default' : 'outline'} 
            onClick={() => setFilter('pending')}
            className="relative"
          >
            Pending
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {pendingCount}
              </span>
            )}
          </Button>
          <Button 
            size="sm" 
            variant={filter === 'accepted' ? 'default' : 'outline'} 
            onClick={() => setFilter('accepted')}
          >
            Accepted
            {acceptedCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {acceptedCount}
              </span>
            )}
          </Button>
          <Button 
            size="sm" 
            variant={filter === 'declined' ? 'default' : 'outline'} 
            onClick={() => setFilter('declined')}
          >
            Declined
            {declinedCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {declinedCount}
              </span>
            )}
          </Button>
        </div>
        <div>
          <NewShiftCoverageRequestButton 
            currentUser={currentUser}
            allEmployees={allEmployees || []}
            onRequestSent={onRefresh}
          />
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No shift coverage requests found</h3>
            <p className="text-muted-foreground mb-4">
              {filter !== 'all' ? 
                `You don't have any ${filter} shift coverage requests at the moment.` : 
                "There are currently no shift coverage requests."}
            </p>
            {filter !== 'all' && (
              <Button variant="outline" onClick={() => setFilter('all')}>
                View all requests
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const isIncoming = request.recipient_id === currentUser.id;
            const otherPersonId = isIncoming ? request.sender_id : request.recipient_id;
            const otherPerson = findEmployee(otherPersonId);
            const shiftDetails = request.shift_coverage_requests?.[0];
            const isStatusPending = request.status === 'pending';
            
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
            
            const colors = statusColors[request.status as keyof typeof statusColors];
            
            return (
              <Card key={request.id} className={`overflow-hidden ${colors.card}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {isIncoming ? "Shift Coverage Request" : "Your Coverage Request"}
                    </CardTitle>
                    <Badge variant="outline" className={colors.badge}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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
                    
                    {shiftDetails && (
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
                    )}
                    
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
                          onClick={() => shiftDetails && onRespond({
                            communicationId: request.id,
                            shiftRequestId: shiftDetails.id,
                            accept: true,
                            senderId: request.sender_id
                          })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => shiftDetails && onRespond({
                            communicationId: request.id,
                            shiftRequestId: shiftDetails.id,
                            accept: false,
                            senderId: request.sender_id
                          })}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
};
