
import React, { useEffect, useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { User } from "@/types";
import { useTimeManagement } from "@/contexts/timeManagement";
import { ErrorAlertBar } from "./ErrorAlertBar";
import { DebugPanel } from "./DebugPanel";
import { TabNavigation } from "./TabNavigation";
import { TabContent } from "./tabs/TabContent";
import { useAllEmployeeShifts } from "@/contexts/timeManagement/hooks/useAllEmployeeShifts";
import { ScheduleWidget } from "./ScheduleWidget";

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
    userRequests,
    loading,
    error,
    pendingRequests,
    processedMessages,
    messagesLoading,
    messagesError,
    handleRetry
  } = useTimeManagement();
  
  // Fetch all employee shifts to ensure we have data for the calendar
  const { shiftsMap, refreshShifts } = useAllEmployeeShifts();
  
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

  return (
    <>
      <ErrorAlertBar error={error} messagesError={messagesError} onRetry={handleRetry} />
      <DebugPanel />
      
      {/* Display work schedule with employee names and shifts */}
      <div className="mb-4">
        <ScheduleWidget 
          currentUser={currentUser}
          allEmployeeShifts={shiftsMap}
          onRefresh={refreshShifts}
        />
      </div>
      
      <Tabs value={activeTab} className="mt-4">
        <TabNavigation isAdmin={isAdmin} />
        <TabContent currentUser={currentUser} isAdmin={isAdmin} />
      </Tabs>
    </>
  );
};
