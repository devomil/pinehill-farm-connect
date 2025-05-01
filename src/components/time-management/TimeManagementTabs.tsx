
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

  // Enhanced debugging
  useEffect(() => {
    console.log("TimeManagementTabs - Current tab:", activeTab);
    console.log("TimeManagementTabs - User requests:", userRequests?.length || 0);
    console.log("TimeManagementTabs - Loading state:", loading);
    console.log("TimeManagementTabs - Error state:", error ? error.message : 'none');
    console.log("TimeManagementTabs - Pending requests:", pendingRequests?.length || 0);
    
    // Detailed logging for messages
    console.log("TimeManagementTabs - Processed messages count:", processedMessages?.length || 0);
    
    // Log shift coverage messages specifically
    const shiftMessages = processedMessages?.filter(msg => msg.type === 'shift_coverage') || [];
    console.log("TimeManagementTabs - Shift coverage messages:", shiftMessages.length);
    
    if (shiftMessages.length > 0) {
      const relevantToUser = shiftMessages.filter(msg => 
        msg.sender_id === currentUser.id || msg.recipient_id === currentUser.id
      );
      console.log(`TimeManagementTabs - Shift coverage messages relevant to ${currentUser.email}:`, relevantToUser.length);
      
      if (relevantToUser.length > 0) {
        console.log("Sample shift message:", {
          id: relevantToUser[0].id,
          sender: relevantToUser[0].sender_id,
          recipient: relevantToUser[0].recipient_id,
          requests: relevantToUser[0].shift_coverage_requests?.length || 0
        });
      }
    }
    
    console.log("TimeManagementTabs - Messages loading:", messagesLoading);
    console.log("TimeManagementTabs - Messages error:", messagesError ? messagesError.message : 'none');
  }, [activeTab, userRequests, loading, error, pendingRequests, processedMessages, messagesLoading, messagesError, currentUser]);

  const handleTabChange = (value: string) => {
    console.log(`Tab changing from ${activeTab} to ${value}`);
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
