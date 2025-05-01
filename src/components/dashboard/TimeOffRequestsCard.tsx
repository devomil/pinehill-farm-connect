
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Clock, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TimeOffRequest } from "@/types/timeManagement";

interface TimeOffRequestsCardProps {
  requests: TimeOffRequest[];
  loading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  showEmployeeName?: boolean;
}

export const TimeOffRequestsCard: React.FC<TimeOffRequestsCardProps> = ({ 
  requests, 
  loading,
  error,
  onRefresh,
  showEmployeeName = false
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Time Off Requests</CardTitle>
          {onRefresh && (
            <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh requests">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
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
        ) : requests.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No pending time off requests
          </div>
        ) : (
          <ul className="space-y-2">
            {requests.map((timeOff) => (
              <li key={timeOff.id} className="flex justify-between items-center">
                <span className="flex flex-col">
                  {showEmployeeName && timeOff.profiles && (
                    <span className="text-sm font-medium">
                      {timeOff.profiles.name || 'Unknown Employee'}
                    </span>
                  )}
                  <span>
                    {timeOff.startDate.toLocaleDateString()} to{' '}
                    {timeOff.endDate.toLocaleDateString()}
                  </span>
                </span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  {timeOff.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
