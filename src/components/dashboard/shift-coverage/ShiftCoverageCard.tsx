
import React, { useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, AlertCircle, RefreshCw, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useShiftCoverageFilters } from "@/hooks/communications/useShiftCoverageFilters";
import { ShiftCoverageEmpty } from "./ShiftCoverageEmpty";
import { ShiftCoverageLoading } from "./ShiftCoverageLoading";
import { ShiftCoverageError } from "./ShiftCoverageError";

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
  // Ensure we have safe values for messages
  const safeMessages = useMemo(() => messages || [], [messages]);
  
  // Use the filter hook with safe values
  const { shiftCoverageRequests, updateFilter } = useShiftCoverageFilters(safeMessages, currentUser);

  // Debug logs for better troubleshooting
  useEffect(() => {
    console.log(`ShiftCoverageCard: Received ${safeMessages.length || 0} messages for user ${currentUser?.id}`);
    console.log(`ShiftCoverageCard: After filtering, found ${shiftCoverageRequests?.length || 0} shift coverage requests`);
    
    if (safeMessages.length > 0) {
      const shiftMessages = safeMessages.filter(m => 
        m.type === 'shift_coverage' && 
        m.shift_coverage_requests?.length > 0
      );
      
      console.log(`ShiftCoverageCard: Found ${shiftMessages.length} shift coverage messages with requests`);
      
      if (shiftMessages.length > 0) {
        console.log("First shift message details:", {
          id: shiftMessages[0].id,
          sender: shiftMessages[0].sender_id,
          recipient: shiftMessages[0].recipient_id,
          request: shiftMessages[0].shift_coverage_requests?.[0] ? {
            id: shiftMessages[0].shift_coverage_requests[0].id,
            date: shiftMessages[0].shift_coverage_requests[0].shift_date,
            status: shiftMessages[0].shift_coverage_requests[0].status
          } : 'No request data'
        });
      }
    } else {
      console.log("ShiftCoverageCard: No messages to display");
    }
  }, [safeMessages, currentUser, shiftCoverageRequests]);

  // Filter to only show pending requests that are relevant to current user
  const filteredMessages = useMemo(() => {
    if (!shiftCoverageRequests || shiftCoverageRequests.length === 0) return [];
    
    return shiftCoverageRequests
      .filter(msg => {
        // Must have shift coverage requests
        if (!msg.shift_coverage_requests || msg.shift_coverage_requests.length === 0) {
          return false;
        }
        
        // Pending requests only for the card
        const isPending = msg.shift_coverage_requests[0].status === 'pending';
        
        return isPending;
      })
      .slice(0, 5); // Limit to 5 most recent
  }, [shiftCoverageRequests]);

  // Helper function to find employee name by ID
  const getEmployeeName = (id: string): string => {
    const employee = employees?.find(emp => emp.id === id);
    return employee?.name || 'Unknown Employee';
  };

  const hasRequests = filteredMessages.length > 0;

  const handleRefresh = () => {
    if (onRefresh) {
      toast.info("Refreshing shift coverage requests...");
      updateFilter();
      onRefresh();
    }
  };

  // If only error and no data, show error card
  if (error && (!shiftCoverageRequests || shiftCoverageRequests.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Shift Coverage Requests</CardTitle>
            {onRefresh && (
              <Button variant="ghost" size="icon" onClick={handleRefresh} title="Refresh requests">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
          <CardDescription>Pending shift coverage requests</CardDescription>
        </CardHeader>
        <CardContent>
          <ShiftCoverageError onRefresh={handleRefresh} inline />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Shift Coverage Requests</CardTitle>
          {onRefresh && (
            <Button variant="ghost" size="icon" onClick={handleRefresh} title="Refresh requests">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          {!onRefresh && <Users className="h-5 w-5 text-muted-foreground" />}
        </div>
        <CardDescription>Pending shift coverage requests</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <ShiftCoverageError onRefresh={handleRefresh} inline />
        ) : loading ? (
          <ShiftCoverageLoading />
        ) : !hasRequests ? (
          <ShiftCoverageEmpty onRefresh={handleRefresh} />
        ) : (
          <div className="space-y-2">
            {filteredMessages.map((message) => {
              const shiftRequest = message.shift_coverage_requests![0];
              const isRequester = shiftRequest.original_employee_id === currentUser.id;
              const requesterId = shiftRequest.original_employee_id;
              const covererId = shiftRequest.covering_employee_id;
              
              return (
                <div key={message.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">
                      {isRequester ? 
                        `You requested ${getEmployeeName(covererId)} to cover` : 
                        `${getEmployeeName(requesterId)} requested coverage`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {shiftRequest.shift_date} ({shiftRequest.shift_start} - {shiftRequest.shift_end})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sent on {format(new Date(message.created_at), "MMM d")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 mb-2">
                      <Clock className="h-3 w-3 mr-1" />
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
}
