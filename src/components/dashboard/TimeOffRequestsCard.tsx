
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Clock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TimeOffRequestsCardProps {
  requests: any[];
  loading?: boolean;
  error?: Error | null;
}

export const TimeOffRequestsCard: React.FC<TimeOffRequestsCardProps> = ({ 
  requests, 
  loading,
  error
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Time Off Requests</CardTitle>
          <Clock className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>Your pending requests</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load time off requests
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="text-center py-4">
            <div className="animate-pulse h-6 bg-muted rounded w-3/4 mx-auto mb-2"></div>
            <div className="animate-pulse h-6 bg-muted rounded w-2/3 mx-auto"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No pending time off requests
          </div>
        ) : (
          <ul className="space-y-2">
            {requests.map((timeOff) => (
              <li key={timeOff.id} className="flex justify-between items-center">
                <span>
                  {new Date(timeOff.start_date).toLocaleDateString()} to{' '}
                  {new Date(timeOff.end_date).toLocaleDateString()}
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
