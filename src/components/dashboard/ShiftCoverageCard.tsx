
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { Link } from "react-router-dom";

interface ShiftCoverageCardProps {
  messages: Communication[];
  currentUser: User;
  loading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
}

export const ShiftCoverageCard: React.FC<ShiftCoverageCardProps> = ({
  messages,
  currentUser,
  loading,
  error,
  onRefresh
}) => {
  const { employees } = useEmployeeDirectory();

  // Filter to only show pending requests that are relevant to current user
  const filteredMessages = messages
    .filter(msg => {
      // Must have shift coverage requests
      if (!msg.shift_coverage_requests || msg.shift_coverage_requests.length === 0) {
        return false;
      }
      
      // Pending requests only
      const isPending = msg.shift_coverage_requests[0].status === 'pending';
      
      // Admin sees all pending shift coverage requests
      if (currentUser.role === 'admin') {
        return isPending;
      }
      
      // Regular users only see their own requests
      const isUserInvolved = msg.sender_id === currentUser.id || 
                             msg.recipient_id === currentUser.id;
      
      return isPending && isUserInvolved;
    })
    .slice(0, 5); // Limit to 5 most recent

  // Helper function to find employee name by ID
  const getEmployeeName = (id: string): string => {
    const employee = employees?.find(emp => emp.id === id);
    return employee?.name || 'Unknown Employee';
  };

  const hasRequests = filteredMessages.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Shift Coverage Requests</CardTitle>
          {onRefresh && (
            <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh requests">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          {!onRefresh && <Users className="h-5 w-5 text-muted-foreground" />}
        </div>
        <CardDescription>Pending shift coverage requests</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex justify-between w-full items-center">
              <span>Failed to load shift coverage requests</span>
              {onRefresh && (
                <Button size="sm" variant="ghost" onClick={onRefresh}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="space-y-2">
            <div className="animate-pulse h-6 bg-muted rounded w-3/4"></div>
            <div className="animate-pulse h-6 bg-muted rounded w-2/3"></div>
          </div>
        ) : !hasRequests ? (
          <div className="text-center py-4 text-muted-foreground">
            No pending shift coverage requests
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMessages.map((message) => {
              const shiftRequest = message.shift_coverage_requests![0];
              const isIncoming = message.recipient_id === currentUser.id;
              const otherPersonId = isIncoming ? message.sender_id : message.recipient_id;
              
              return (
                <div key={message.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">
                      {isIncoming ? 
                        `${getEmployeeName(message.sender_id)} requested coverage` : 
                        `You requested ${getEmployeeName(message.recipient_id)} to cover`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {shiftRequest.shift_date} ({shiftRequest.shift_start} - {shiftRequest.shift_end})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sent on {format(new Date(message.created_at), "MMM d")}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 mr-2">
                      Pending
                    </Badge>
                    <Link to="/time?tab=shift-coverage">
                      <Button size="sm" variant="ghost">View</Button>
                    </Link>
                  </div>
                </div>
              );
            })}
            
            {hasRequests && (
              <div className="pt-2 text-center">
                <Link to="/time?tab=shift-coverage">
                  <Button variant="link" size="sm">
                    View All Requests
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
