
import React, { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTimeOffRequests } from "@/components/time-management/UserTimeOffRequests";
import { PendingTimeOffApprovals } from "@/components/time-management/PendingTimeOffApprovals";
import { TeamCalendar } from "@/components/time-management/TeamCalendar";
import { ShiftCoverageRequestsTab } from "@/components/time-management/shift-coverage";
import { useTimeManagement } from "@/contexts/TimeManagementContext";
import { User } from "@/types";

interface TimeManagementTabsProps {
  currentUser: User;
  isAdmin: boolean;
}

export const TimeManagementTabs: React.FC<TimeManagementTabsProps> = ({
  currentUser,
  isAdmin
}) => {
  const {
    activeTab,
    setActiveTab,
    userRequests,
    loading,
    error,
    fetchRequests,
    pendingRequests,
    processedMessages,
    messagesLoading,
    respondToShiftRequest,
    refreshMessages,
    messagesError
  } = useTimeManagement();

  // Debug information
  useEffect(() => {
    console.log("TimeManagementTabs - Current tab:", activeTab);
    console.log("TimeManagementTabs - User requests:", userRequests);
    console.log("TimeManagementTabs - Loading state:", loading);
    console.log("TimeManagementTabs - Error state:", error);
    console.log("TimeManagementTabs - Pending requests:", pendingRequests);
    console.log("TimeManagementTabs - Processed messages:", processedMessages);
    console.log("TimeManagementTabs - Messages loading:", messagesLoading);
    console.log("TimeManagementTabs - Messages error:", messagesError);
  }, [activeTab, userRequests, loading, error, pendingRequests, processedMessages, messagesLoading, messagesError]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Refresh data when switching to specific tabs
    if (value === "shift-coverage") {
      console.log("Refreshing messages due to tab change to shift-coverage");
      refreshMessages();
    } else if (value === "my-requests") {
      console.log("Refreshing time-off requests due to tab change to my-requests");
      fetchRequests();
    }
  };

  // Force initial data fetch on component mount
  useEffect(() => {
    console.log("TimeManagementTabs - Initial fetch");
    fetchRequests();
    refreshMessages();
  }, [fetchRequests, refreshMessages]);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="mb-4">
        <TabsTrigger value="my-requests">My Requests</TabsTrigger>
        <TabsTrigger value="shift-coverage">Shift Coverage</TabsTrigger>
        {isAdmin && <TabsTrigger value="pending-approvals">Pending Approvals</TabsTrigger>}
        <TabsTrigger value="team-calendar">Team Calendar</TabsTrigger>
      </TabsList>
      <TabsContent value="my-requests" className="space-y-4 pt-4">
        <UserTimeOffRequests
          userRequests={userRequests || []}
          loading={loading}
          refresh={fetchRequests}
          error={error}
        />
      </TabsContent>
      <TabsContent value="shift-coverage" className="space-y-4 pt-4">
        <ShiftCoverageRequestsTab
          messages={processedMessages || []}
          loading={messagesLoading}
          onRespond={respondToShiftRequest}
          currentUser={currentUser}
          onRefresh={refreshMessages}
          error={messagesError}
        />
      </TabsContent>
      {isAdmin && (
        <TabsContent value="pending-approvals" className="space-y-4 pt-4">
          <PendingTimeOffApprovals pendingRequests={pendingRequests || []} refresh={fetchRequests} />
        </TabsContent>
      )}
      <TabsContent value="team-calendar" className="pt-4">
        <TeamCalendar currentUser={currentUser} />
      </TabsContent>
    </Tabs>
  );
}
