
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, RefreshCw } from "lucide-react";
import { TimeOffRequest } from "@/types/timeManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PendingTimeOffApprovalsProps {
  pendingRequests: TimeOffRequest[];
  refresh: () => void;
}

export const PendingTimeOffApprovals: React.FC<PendingTimeOffApprovalsProps> = ({
  pendingRequests,
  refresh,
}) => {
  const [employeeNames, setEmployeeNames] = useState<Record<string, string>>({});
  const [loadingNames, setLoadingNames] = useState(true);
  const isMounted = useRef(true);
  const lastFetchTime = useRef<number>(0);

  // Fetch employee names for all pending requests - with throttling
  useEffect(() => {
    // Set up cleanup reference
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchEmployeeNames = useCallback(async () => {
    // Skip if no pending requests
    if (!pendingRequests.length) {
      setLoadingNames(false);
      return;
    }
    
    // Throttle fetches to prevent too many requests
    const now = Date.now();
    if (now - lastFetchTime.current < 3000) {
      return; // Skip if less than 3 seconds since last fetch
    }
    
    lastFetchTime.current = now;
    setLoadingNames(true);
    
    try {
      // Get unique user IDs from pending requests
      const userIds = [...new Set(pendingRequests.map(req => req.user_id))];
      
      // Skip if no unique user IDs
      if (userIds.length === 0) {
        setLoadingNames(false);
        return;
      }
      
      // Fetch profiles for these user IDs
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);
        
      if (error) throw error;
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        // Create a mapping of user IDs to names
        const namesMap: Record<string, string> = {};
        data?.forEach(profile => {
          // Use name if available, otherwise fallback to email or unknown
          namesMap[profile.id] = profile.name || profile.email?.split('@')[0] || 'Unknown Employee';
        });
        
        setEmployeeNames(namesMap);
        setLoadingNames(false);
      }
    } catch (error) {
      console.error("Error fetching employee names:", error);
      if (isMounted.current) {
        toast.error("Failed to load employee information");
        setLoadingNames(false);
      }
    }
  }, [pendingRequests]);

  // Trigger fetch when pending requests change
  useEffect(() => {
    fetchEmployeeNames();
  }, [fetchEmployeeNames]);

  const handleAction = useCallback(async (requestId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("time_off_requests")
        .update({ status })
        .eq("id", requestId);

      if (error) {
        throw error;
      }
      
      toast.success(`Request ${status}!`);
      refresh();
      
      // Send notification to employee (optional)
      // This could be implemented through a Supabase function or edge function
    } catch (error: any) {
      console.error(`Error ${status === "approved" ? "approving" : "rejecting"} request:`, error);
      toast.error(`Failed to ${status === "approved" ? "approve" : "reject"} request: ${error.message}`);
    }
  }, [refresh]);

  if (pendingRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-lg font-medium">No pending approvals</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          All time-off requests have been processed.
        </p>
        <Button variant="outline" className="mt-4" onClick={refresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
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
                <h4 className="font-medium mb-1">
                  {loadingNames ? (
                    <span className="inline-block w-32 h-5 bg-gray-200 animate-pulse rounded"></span>
                  ) : (
                    employeeNames[request.user_id] || "Unknown Employee"
                  )}
                </h4>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(request.start_date).toLocaleDateString()} to {new Date(request.end_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{request.reason || 'No reason provided'}</p>
                {request.notes && <p className="text-xs text-muted-foreground italic mb-2">Note: {request.notes}</p>}
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
}
