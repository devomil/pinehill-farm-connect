
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface TimeOffRequestsCardProps {
  requests: any[];
}

export const TimeOffRequestsCard: React.FC<TimeOffRequestsCardProps> = ({ requests }) => {
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
      </CardContent>
    </Card>
  );
};
