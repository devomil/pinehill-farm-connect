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
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

interface ShiftCoverageCardProps {
  messages: Communication[];
  currentUser: User;
  loading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  clickable?: boolean;
  viewAllUrl?: string;
}

export const ShiftCoverageCard: React.FC<ShiftCoverageCardProps> = ({
  messages,
  currentUser,
  loading,
  error,
  onRefresh,
  clickable = false,
  viewAllUrl
}) => {
  // Store refresh state to prevent multiple rapid refreshes
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const lastRefreshTime = React.useRef<number>(0);
  const navigate = useNavigate();
  
  // Ensure we have safe values for messages
  const safeMessages = React.useMemo(() => messages || [], [messages]);
  
  // Use the filter hook with safe values
  const { shiftCoverageRequests, updateFilter } = useShiftCoverageFilters(safeMessages, currentUser);

  // Debug logs for better troubleshooting - only log when values actually change
  React.useEffect(() => {
    console.log(`ShiftCoverageCard: Received ${safeMessages.length || 0} messages for user ${currentUser?.id}`);
    console.log(`ShiftCoverageCard: After filtering, found ${shiftCoverageRequests?.length || 0} shift coverage requests`);
    
    if (error) {
      console.error("ShiftCoverageCard: Error loading shift coverage requests:", error);
    }
  }, [safeMessages.length, currentUser?.id, shiftCoverageRequests?.length, error]);

  const handleRefresh = (e: React.MouseEvent) => {
    // Stop propagation to prevent card click from triggering
    if (e) {
      e.stopPropagation();
    }
    
    const now = Date.now();
    // Prevent refreshing more than once every 3 seconds
    if (isRefreshing || now - lastRefreshTime.current < 3000) {
      return;
    }

    if (onRefresh) {
      setIsRefreshing(true);
      toast.info("Refreshing shift coverage requests...");
      updateFilter();
      
      // Track the refresh time
      lastRefreshTime.current = now;
      
      // Call the onRefresh callback
      onRefresh();
      
      // Reset refreshing state after a delay
      setTimeout(() => {
        setIsRefreshing(false);
      }, 3000);
    }
  };
  
  const handleCardClick = () => {
    if (clickable) {
      navigate("/time?tab=shift-coverage");
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent card click from triggering
    e.stopPropagation();
  };

  return (
    <Card 
      className={clickable ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}
      onClick={clickable ? handleCardClick : undefined}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Shift Coverage Requests</CardTitle>
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh} 
              title="Refresh requests"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
          {!onRefresh && <Users className="h-5 w-5 text-muted-foreground" />}
        </div>
        <CardDescription>Pending shift coverage requests</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <ShiftCoverageError onRefresh={(e) => handleRefresh(e)} inline />
        ) : loading ? (
          <ShiftCoverageLoading />
        ) : shiftCoverageRequests && shiftCoverageRequests.length > 0 ? (
          <ShiftCoverageList 
            shiftCoverageRequests={shiftCoverageRequests}
            currentUser={currentUser}
            onRefresh={(e) => handleRefresh(e)}
          />
        ) : (
          <ShiftCoverageEmpty onRefresh={(e) => handleRefresh(e)} />
        )}
        
        {viewAllUrl && (
          <div className="text-center mt-4">
            <Link to={viewAllUrl} onClick={handleButtonClick}>
              <Button variant="warning" size="sm" className="w-full">
                View All Requests
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
