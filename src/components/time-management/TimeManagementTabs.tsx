
import React, { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTimeOffRequests } from "@/components/time-management/UserTimeOffRequests";
import { PendingTimeOffApprovals } from "@/components/time-management/PendingTimeOffApprovals";
import { TeamCalendar } from "@/components/time-management/TeamCalendar";
import { ShiftCoverageRequestsTab } from "@/components/time-management/shift-coverage";
import { useTimeManagement } from "@/contexts/TimeManagementContext";
import { User } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    messagesError,
    handleRetry,
    allEmployees,
    forceRefreshData
  } = useTimeManagement();

  // Enhanced debugging
  useEffect(() => {
    console.log("TimeManagementTabs - Current tab:", activeTab);
    console.log("TimeManagementTabs - User requests:", userRequests?.length || 0);
    console.log("TimeManagementTabs - Loading state:", loading);
    console.log("TimeManagementTabs - Error state:", error ? error.message : 'none');
    console.log("TimeManagementTabs - Pending requests:", pendingRequests?.length || 0);
    console.log("TimeManagementTabs - Available employees:", allEmployees?.length || 0);
    
    // Detailed logging for messages
    console.log("TimeManagementTabs - Processed messages count:", processedMessages?.length || 0);
    
    // Log shift coverage messages specifically
    const shiftMessages = processedMessages?.filter(msg => msg.type === 'shift_coverage') || [];
    console.log("TimeManagementTabs - Shift coverage messages:", shiftMessages.length);
  }, [activeTab, userRequests, loading, error, pendingRequests, processedMessages, messagesLoading, messagesError, currentUser, allEmployees]);

  const handleTabChange = (value: string) => {
    console.log(`Tab changing from ${activeTab} to ${value}`);
    setActiveTab(value);
    
    // Force full refresh when switching to shift coverage to ensure we have the latest data
    if (value === "shift-coverage" && value !== activeTab) {
      console.log("Refreshing all data due to tab change to shift-coverage");
      forceRefreshData();
    } else if (value === "my-requests" && value !== activeTab) {
      console.log("Refreshing time-off requests due to tab change to my-requests");
      fetchRequests();
    }
  };

  // Show any errors at the top of the tabs area
  const hasErrors = error || messagesError;

  return (
    <>
      {hasErrors && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading data: {error?.message || messagesError?.message || "Unknown error"}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry} 
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
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
            allEmployees={allEmployees}
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
    </>
  );
};
