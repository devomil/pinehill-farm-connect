
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeOffRequest } from "@/types";
import { TimeOffRequestForm } from "@/components/time-management/TimeOffRequestForm";
import { UserTimeOffRequests } from "@/components/time-management/UserTimeOffRequests";
import { PendingTimeOffApprovals } from "@/components/time-management/PendingTimeOffApprovals";
import { TeamCalendarPlaceholder } from "@/components/time-management/TeamCalendarPlaceholder";

export default function TimeManagement() {
  const { currentUser } = useAuth();
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([
    {
      id: "1",
      userId: "2",
      startDate: new Date("2023-06-10"),
      endDate: new Date("2023-06-15"),
      reason: "Family vacation",
      status: "pending",
    },
    {
      id: "2",
      userId: "2",
      startDate: new Date("2023-04-21"),
      endDate: new Date("2023-04-21"),
      reason: "Doctor appointment",
      status: "approved",
    },
  ]);

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

  // Show form dialog when empty state is clicked
  const [formOpen, setFormOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Time Management</h1>
            <p className="text-muted-foreground">Request and manage time off</p>
          </div>
          {/* New Time Off Request Form */}
          <div>
            <TimeOffRequestForm
              currentUser={currentUser}
              onRequest={(newRequest) =>
                setTimeOffRequests([newRequest, ...timeOffRequests])
              }
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
              onNewRequest={() => setFormOpen(true)}
            />
          </TabsContent>
          {isAdmin && (
            <TabsContent value="pending-approvals" className="space-y-4 pt-4">
              <PendingTimeOffApprovals pendingRequests={pendingRequests} />
            </TabsContent>
          )}
          <TabsContent value="team-calendar" className="pt-4">
            <TeamCalendarPlaceholder />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
