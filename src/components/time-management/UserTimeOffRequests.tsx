
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Plus, Calendar } from "lucide-react";
import { TimeOffRequest } from "@/types";

interface UserTimeOffRequestsProps {
  userRequests: TimeOffRequest[];
  loading?: boolean;
  refresh?: () => void;
}

export const UserTimeOffRequests: React.FC<UserTimeOffRequestsProps> = ({
  userRequests,
  loading,
  refresh,
}) => {
  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
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
          <Button className="mt-4" onClick={refresh}>
            <Plus className="h-4 w-4 mr-2" />
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
                    {request.startDate.toLocaleDateString()} to {request.endDate.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{request.reason}</p>
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
    </div>
  );
};
