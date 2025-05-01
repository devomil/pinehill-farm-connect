
import React, { useState, useEffect } from "react";
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
import { ShiftCoverageRequestsTab } from "@/components/time-management/ShiftCoverageRequestsTab";
import { useCommunications } from "@/hooks/useCommunications";
import { useProcessMessages } from "@/hooks/communications/useProcessMessages";

export default function TimeManagement() {
  const { currentUser } = useAuth();
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Get communications data for shift coverage requests
  const { messages: rawMessages, isLoading: messagesLoading, respondToShiftRequest, refreshMessages } = useCommunications();
  const processedMessages = useProcessMessages(rawMessages, currentUser);

  const fetchRequests = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching time off requests for user:", currentUser.id);
      const { data, error } = await supabase
        .from("time_off_requests")
        .select("*");
        
      if (error) {
        console.error("Supabase error:", error);
        throw error;
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
      }
    } catch (err: any) {
      console.error("Failed to fetch time-off requests:", err);
      setError(err);
      toast.error("Failed to fetch time-off requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    refreshMessages(); // Also fetch messages for shift coverage requests
  }, [currentUser, refreshMessages]);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Time Management</h1>
            <p className="text-muted-foreground">Request and manage time off</p>
          </div>
          <div>
            <TimeOffRequestForm
              currentUser={currentUser}
              onRequestSubmitted={fetchRequests}
            />
          </div>
        </div>
        <Tabs defaultValue="my-requests">
          <TabsList>
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
