
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { toast } from "sonner";
import { ShiftCoverageList } from "./ShiftCoverageList";
import { ShiftCoverageLoading } from "./ShiftCoverageLoading";
import { ShiftCoverageError } from "./ShiftCoverageError";
import { ShiftCoverageEmpty } from "./ShiftCoverageEmpty";
import { useShiftCoverageFilters } from "@/hooks/communications/useShiftCoverageFilters";

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
  // Ensure we have safe values for messages
  const safeMessages = React.useMemo(() => messages || [], [messages]);
  
  // Use the filter hook with safe values
  const { shiftCoverageRequests, updateFilter } = useShiftCoverageFilters(safeMessages, currentUser);

  // Debug logs for better troubleshooting
  React.useEffect(() => {
    console.log(`ShiftCoverageCard: Received ${safeMessages.length || 0} messages for user ${currentUser?.id}`);
    console.log(`ShiftCoverageCard: After filtering, found ${shiftCoverageRequests?.length || 0} shift coverage requests`);
    
    if (error) {
      console.error("ShiftCoverageCard: Error loading shift coverage requests:", error);
    }
    
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
  }, [safeMessages, currentUser, shiftCoverageRequests, error]);

  const handleRefresh = () => {
    if (onRefresh) {
      toast.info("Refreshing shift coverage requests...");
      updateFilter();
      onRefresh();
    }
  };

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
        ) : shiftCoverageRequests && shiftCoverageRequests.length > 0 ? (
          <ShiftCoverageList 
            shiftCoverageRequests={shiftCoverageRequests}
            currentUser={currentUser}
            onRefresh={handleRefresh}
          />
        ) : (
          <ShiftCoverageEmpty onRefresh={handleRefresh} />
        )}
      </CardContent>
    </Card>
  );
}
