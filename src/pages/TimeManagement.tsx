
import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeOffRequest } from "@/types";
import { TimeOffRequestForm } from "@/components/time-management/TimeOffRequestForm";
import { UserTimeOffRequests } from "@/components/time-management/UserTimeOffRequests";
import { PendingTimeOffApprovals } from "@/components/time-management/PendingTimeOffApprovals";
import { TeamCalendar } from "@/components/time-management/TeamCalendar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShiftCoverageRequestsTab } from "@/components/time-management/shift-coverage";
import { useCommunications } from "@/hooks/useCommunications";
import { useProcessMessages } from "@/hooks/communications/useProcessMessages";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function TimeManagement() {
  const { currentUser } = useAuth();
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState("my-requests");
  const [retryCount, setRetryCount] = useState(0);
  
  // Get communications data for shift coverage requests
  const { 
    messages: rawMessages, 
    isLoading: messagesLoading, 
    error: messagesError, 
    respondToShiftRequest, 
    refreshMessages 
  } = useCommunications();
  
  const processedMessages = useProcessMessages(rawMessages, currentUser);

  const fetchRequests = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching time off requests for user:", currentUser.id);
      const { data, error: fetchError } = await supabase
        .from("time_off_requests")
        .select("*");
        
      if (fetchError) {
        console.error("Supabase error:", fetchError);
        throw fetchError;
      }
      
      if (data) {
        console.log(`Retrieved ${data.length} time off requests:`, data);
        setTimeOffRequests(
          data.map((r: any) => ({
            ...r,
            startDate: new Date(r.start_date),
            endDate: new Date(r.end_date),
            status: r.status,
            id: r.id,
            reason: r.reason,
            userId: r.user_id,
            notes: r.notes,
          }))
        );
        
        // Show success notification after successful fetch to provide user feedback
        if (retryCount > 0) {
          toast.success("Time off requests refreshed successfully");
        }
      } else {
        console.log("No time off requests data returned");
        setTimeOffRequests([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch time-off requests:", err);
      setError(err);
      toast.error("Failed to fetch time-off requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, retryCount]);

  // Retry logic for failed fetches
  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
    toast.info("Retrying data fetch...");
    fetchRequests();
    refreshMessages();
  };

  // Force refresh of data
  const forceRefreshData = useCallback(() => {
    setRetryCount(prevCount => prevCount + 1);
    fetchRequests();
    refreshMessages();
  }, [fetchRequests, refreshMessages]);

  useEffect(() => {
    if (currentUser) {
      fetchRequests();
      refreshMessages(); // Also fetch messages for shift coverage requests
    }
  }, [currentUser, fetchRequests, refreshMessages, retryCount]);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Refresh data when switching to specific tabs
    if (value === "shift-coverage") {
      refreshMessages();
    } else if (value === "my-requests") {
      fetchRequests();
    }
  };

  if (!currentUser) {
    return (
      <DashboardLayout>
        <div className="p-6">You must be logged in to view this page.</div>
      </DashboardLayout>
    );
  }

  const isAdmin = currentUser.role === "admin";
  const pendingRequests = timeOffRequests.filter(
    (request) => request.status === "pending"
  );
  const userRequests = timeOffRequests.filter(
    (request) => request.userId === currentUser.id
  );

  // Display global error message if both requests fail
  const showGlobalError = error && messagesError;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {showGlobalError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>There was a problem loading your time management data.</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetry}
                className="ml-2 whitespace-nowrap"
              >
                <RefreshCw className="mr-2 h-3 w-3" /> Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
      
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Time Management</h1>
            <p className="text-muted-foreground">Request and manage time off</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={forceRefreshData} title="Refresh data">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <TimeOffRequestForm
              currentUser={currentUser}
              onRequestSubmitted={fetchRequests}
            />
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            <TabsTrigger value="shift-coverage">Shift Coverage</TabsTrigger>
            {isAdmin && <TabsTrigger value="pending-approvals">Pending Approvals</TabsTrigger>}
            <TabsTrigger value="team-calendar">Team Calendar</TabsTrigger>
          </TabsList>
          <TabsContent value="my-requests" className="space-y-4 pt-4">
            <UserTimeOffRequests
              userRequests={userRequests}
              loading={loading}
              refresh={fetchRequests}
              error={error}
            />
          </TabsContent>
          <TabsContent value="shift-coverage" className="space-y-4 pt-4">
            <ShiftCoverageRequestsTab
              messages={processedMessages}
              loading={messagesLoading}
              onRespond={respondToShiftRequest}
              currentUser={currentUser}
              onRefresh={refreshMessages}
              error={messagesError}
            />
          </TabsContent>
          {isAdmin && (
            <TabsContent value="pending-approvals" className="space-y-4 pt-4">
              <PendingTimeOffApprovals pendingRequests={pendingRequests} refresh={fetchRequests} />
            </TabsContent>
          )}
          <TabsContent value="team-calendar" className="pt-4">
            <TeamCalendar currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
