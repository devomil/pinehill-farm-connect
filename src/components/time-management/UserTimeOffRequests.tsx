
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Plus, Calendar, RefreshCw } from "lucide-react";
import { TimeOffRequest } from "@/types/timeManagement";

interface UserTimeOffRequestsProps {
  userRequests: TimeOffRequest[];
  loading?: boolean;
  refresh?: () => void;
  error?: Error | null;
}

export const UserTimeOffRequests: React.FC<UserTimeOffRequestsProps> = ({
  userRequests,
  loading,
  refresh,
  error,
}) => {
  const handleRefresh = () => {
    if (refresh) {
      try {
        refresh();
      } catch (error) {
        console.error("Error refreshing time off requests:", error);
      }
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <Clock className="mx-auto h-12 w-12 text-destructive opacity-50" />
        <h3 className="mt-4 text-lg font-medium">Error loading time-off requests</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          There was a problem loading your requests. Please try again.
        </p>
        {refresh && (
          <Button className="mt-4" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((index) => (
          <Card key={`loading-${index}`} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="w-2/3">
                  <div className="animate-pulse h-5 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="animate-pulse h-4 bg-muted rounded w-1/2"></div>
                </div>
                <div className="animate-pulse h-6 bg-muted rounded-full w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (userRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-lg font-medium">No time-off requests yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your first time-off request to get started.
        </p>
        {refresh && (
          <Button className="mt-4" onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {userRequests.map((request) => (
        <Card key={request.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {new Date(request.start_date).toLocaleDateString()} to {new Date(request.end_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{request.reason || "No reason provided"}</p>
                {request.notes && <p className="text-xs text-muted-foreground italic">Note: {request.notes}</p>}
              </div>
              <div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                  ${request.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : request.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`
                }>
                  {request.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {refresh && (
        <div className="flex justify-center mt-6">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-3 w-3 mr-2" />
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
};
