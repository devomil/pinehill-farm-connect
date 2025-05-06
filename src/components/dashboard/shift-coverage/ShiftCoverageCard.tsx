
import React, { useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { toast } from "sonner";
import { useShiftCoverageFilters } from "@/hooks/communications/useShiftCoverageFilters";
import { ShiftCoverageError } from "./ShiftCoverageError";
import { ShiftCoverageLoading } from "./ShiftCoverageLoading";
import { ShiftCoverageEmpty } from "./ShiftCoverageEmpty";
import { ShiftCoverageList } from "./ShiftCoverageList";

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
  const safeMessages = useMemo(() => messages || [], [messages]);
  
  // Filter messages using the custom hook
  const { shiftCoverageRequests, updateFilter } = useShiftCoverageFilters(safeMessages, currentUser);

  // Debug logging
  useEffect(() => {
    console.log(`ShiftCoverageCard: Received ${safeMessages.length || 0} messages for user ${currentUser?.id}`);
    console.log(`ShiftCoverageCard: After filtering, found ${shiftCoverageRequests?.length || 0} shift coverage requests`);
  }, [safeMessages, currentUser, shiftCoverageRequests]);

  const handleRefresh = () => {
    if (onRefresh) {
      toast.info("Refreshing shift coverage requests...");
      updateFilter();
      onRefresh();
    }
  };

  // If only error and no data, show error card
  if (error && (!shiftCoverageRequests || shiftCoverageRequests.length === 0)) {
    return <ShiftCoverageError onRefresh={handleRefresh} />;
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
        ) : (
          <ShiftCoverageList 
            shiftCoverageRequests={shiftCoverageRequests}
            currentUser={currentUser}
            onRefresh={handleRefresh}
          />
        )}
      </CardContent>
    </Card>
  );
};
