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
import { toast } from "@/components/ui/sonner";

export default function TimeManagement() {
  const { currentUser } = useAuth();
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    if (!currentUser) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("time_off_requests")
      .select("*");
    if (error) {
      toast.error("Failed to fetch time-off requests");
      setLoading(false);
      return;
    }
    if (data) {
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
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser]);

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
            {isAdmin && <TabsTrigger value="pending-approvals">Pending Approvals</TabsTrigger>}
            <TabsTrigger value="team-calendar">Team Calendar</TabsTrigger>
          </TabsList>
          <TabsContent value="my-requests" className="space-y-4 pt-4">
            <UserTimeOffRequests
              userRequests={userRequests}
              loading={loading}
              refresh={fetchRequests}
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
