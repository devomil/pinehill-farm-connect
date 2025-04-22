
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar } from "lucide-react";
import { TimeOffRequest } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

// Helper to get user's name (can be improved with join if employee info in db)
const EMPLOYEE_NAMES: Record<string, string> = {
  "1": "Admin User",
  "2": "John Employee",
  "3": "Sarah Johnson"
};

interface PendingTimeOffApprovalsProps {
  pendingRequests: TimeOffRequest[];
  refresh: () => void;
}

export const PendingTimeOffApprovals: React.FC<PendingTimeOffApprovalsProps> = ({
  pendingRequests,
  refresh,
}) => {

  const handleAction = async (requestId: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("time_off_requests")
      .update({ status })
      .eq("id", requestId);

    if (error) {
      toast.error(`Failed to ${status === "approved" ? "approve" : "reject"} request`);
      return;
    }
    toast.success(`Request ${status}!`);
    refresh && refresh();
    // Optionally: invoke notification logic for employee here
  };

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
                <h4 className="font-medium mb-1">{EMPLOYEE_NAMES[request.userId] || "Unknown"}</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {request.startDate.toLocaleDateString()} to {request.endDate.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{request.reason}</p>
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                  onClick={() => handleAction(request.id, "rejected")}
                >
                  Reject
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                  onClick={() => handleAction(request.id, "approved")}
                >
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
