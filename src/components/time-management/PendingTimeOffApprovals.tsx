
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar } from "lucide-react";
import { TimeOffRequest } from "@/types";

interface PendingTimeOffApprovalsProps {
  pendingRequests: TimeOffRequest[];
}

export const PendingTimeOffApprovals: React.FC<PendingTimeOffApprovalsProps> = ({
  pendingRequests,
}) => {
  if (!pendingRequests.length) {
    return (
      <div className="text-center py-12">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-lg font-medium">No pending approvals</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          All time-off requests have been processed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingRequests.map((request) => (
        <Card key={request.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium mb-1">John Employee</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {request.startDate.toLocaleDateString()} to {request.endDate.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{request.reason}</p>
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700">
                  Reject
                </Button>
                <Button variant="outline" size="sm" className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700">
                  Approve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
