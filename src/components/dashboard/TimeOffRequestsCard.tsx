
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Clock, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TimeOffRequest } from "@/types/timeManagement";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface TimeOffRequestsCardProps {
  requests: TimeOffRequest[];
  loading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  showEmployeeName?: boolean;
  clickable?: boolean;
  viewAllUrl?: string;
}

export const TimeOffRequestsCard: React.FC<TimeOffRequestsCardProps> = ({ 
  requests, 
  loading,
  error,
  onRefresh,
  showEmployeeName = false,
  clickable = false,
  viewAllUrl
}) => {
  // Store refresh state to prevent multiple rapid refreshes
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const lastRefreshTime = React.useRef<number>(0);
  
  const handleRefresh = (e: React.MouseEvent) => {
    // Stop event propagation to prevent card click handler from firing
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
      toast.info("Refreshing time off requests...");
      
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
  
  const handleButtonClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent parent click handlers from firing
    e.stopPropagation();
  };
  
  // Safe guard against undefined requests
  const safeRequests = React.useMemo(() => 
    Array.isArray(requests) ? requests : [],
    [requests]
  );
  
  return (
    <Card className={clickable ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Time Off Requests</CardTitle>
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
          {!onRefresh && <Clock className="h-5 w-5 text-muted-foreground" />}
        </div>
        <CardDescription>Your pending requests</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex justify-between w-full items-center">
              <span>Failed to load time off requests</span>
              {onRefresh && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
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
        ) : safeRequests.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No pending time off requests</p>
            {onRefresh && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh} 
                className="mt-2"
                disabled={isRefreshing}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {safeRequests.map((timeOff) => (
              <li key={timeOff.id} className="flex justify-between items-center">
                <span className="flex flex-col">
                  {showEmployeeName && timeOff.profiles && (
                    <span className="text-sm font-medium">
                      {timeOff.profiles.name || 'Unknown Employee'}
                    </span>
                  )}
                  <span>
                    {new Date(timeOff.start_date).toLocaleDateString()} to{' '}
                    {new Date(timeOff.end_date).toLocaleDateString()}
                  </span>
                </span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  {timeOff.status}
                </span>
              </li>
            ))}
          </ul>
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
};
