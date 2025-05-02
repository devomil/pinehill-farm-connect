
import React, { useEffect, useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTimeOffRequests } from "@/components/time-management/UserTimeOffRequests";
import { PendingTimeOffApprovals } from "@/components/time-management/PendingTimeOffApprovals";
import { TeamCalendar } from "@/components/time-management/TeamCalendar";
import { ShiftCoverageRequestsTab } from "@/components/time-management/shift-coverage";
import { useTimeManagement } from "@/contexts/timeManagement";
import { User } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Bug, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
    messagesError,
    respondToShiftRequest,
    refreshMessages,
    handleRetry,
    forceRefreshData
  } = useTimeManagement();
  
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Enhanced debugging with less frequent logging to prevent re-renders
  useEffect(() => {
    console.log("TimeManagementTabs - Current tab:", activeTab);
    console.log("TimeManagementTabs - User requests:", userRequests?.length || 0);
    console.log("TimeManagementTabs - Loading state:", loading);
    console.log("TimeManagementTabs - Error state:", error ? error.message : 'none');
    console.log("TimeManagementTabs - Pending requests:", pendingRequests?.length || 0);
    console.log("TimeManagementTabs - Processed messages count:", processedMessages?.length || 0);
    
    // Log shift coverage messages specifically
    const shiftMessages = processedMessages?.filter(msg => msg.type === 'shift_coverage') || [];
    console.log("TimeManagementTabs - Shift coverage messages:", shiftMessages.length);
  }, [activeTab, userRequests, loading, error, pendingRequests, processedMessages, messagesLoading, messagesError]);

  // Memoize tab change handler to prevent recreation on every render
  const handleTabChange = useCallback((value: string) => {
    console.log(`Tab changing from ${activeTab} to ${value}`);
    
    // Only update if actually changing tabs
    if (value !== activeTab) {
      setActiveTab(value);
      
      // Force full refresh when switching to shift coverage to ensure we have the latest data
      if (value === "shift-coverage") {
        console.log("Refreshing all data due to tab change to shift-coverage");
        forceRefreshData();
      } else if (value === "my-requests") {
        console.log("Refreshing time-off requests due to tab change to my-requests");
        fetchRequests();
      }
    }
  }, [activeTab, setActiveTab, forceRefreshData, fetchRequests]);

  // Format error messages safely for display
  const formatErrorMessage = (err: any): React.ReactNode => {
    if (typeof err === 'string') return err;
    if (err?.message) return err.message;
    return "Unknown error";
  };

  // Show any errors at the top of the tabs area
  const hasErrors = error || messagesError;

  return (
    <>
      {hasErrors && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading data: {formatErrorMessage(error || messagesError)}
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
      
      {/* Debug toggle button */}
      <div className="flex justify-end mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="h-8 text-xs"
        >
          <Bug className="h-3 w-3 mr-1" /> {showDebugInfo ? "Hide Debug" : "Show Debug"}
        </Button>
      </div>

      {/* Debug information panel */}
      {showDebugInfo && (
        <Accordion type="single" collapsible className="mb-4">
          <AccordionItem value="debug-info">
            <AccordionTrigger className="text-sm">Time Management Debug Information</AccordionTrigger>
            <AccordionContent className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
              <p><strong>Active Tab:</strong> {activeTab}</p>
              <p><strong>Loading state:</strong> {loading ? "true" : "false"}</p>
              <p><strong>Messages Loading state:</strong> {messagesLoading ? "true" : "false"}</p>
              <p><strong>User requests count:</strong> {userRequests?.length || 0}</p>
              <p><strong>Pending requests count:</strong> {pendingRequests?.length || 0}</p>
              <p><strong>Processed messages count:</strong> {processedMessages?.length || 0}</p>
              <p><strong>Current user:</strong> {currentUser?.email} (ID: {currentUser?.id})</p>
              <p><strong>Is admin:</strong> {isAdmin ? "true" : "false"}</p>
              
              {error && (
                <>
                  <p className="mt-2 font-semibold text-red-500">Error:</p>
                  <pre className="whitespace-pre-wrap text-red-500">
                    {typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error)}
                  </pre>
                </>
              )}
              
              {messagesError && (
                <>
                  <p className="mt-2 font-semibold text-red-500">Messages Error:</p>
                  <pre className="whitespace-pre-wrap text-red-500">
                    {typeof messagesError === 'object' ? JSON.stringify(messagesError, null, 2) : String(messagesError)}
                  </pre>
                </>
              )}

              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={forceRefreshData} className="mr-2">
                  Force Refresh All
                </Button>
                <Button size="sm" variant="outline" onClick={fetchRequests} className="mr-2">
                  Refresh Requests
                </Button>
                <Button size="sm" variant="outline" onClick={refreshMessages}>
                  Refresh Messages
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
