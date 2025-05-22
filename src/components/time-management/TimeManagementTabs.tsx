
import React, { useEffect, useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { User } from "@/types";
import { useTimeManagement } from "@/contexts/timeManagement";
import { ErrorAlertBar } from "./ErrorAlertBar";
import { DebugPanel } from "./DebugPanel";
import { TabNavigation } from "./TabNavigation";
import { TabContent } from "./tabs/TabContent";
import { CalendarContent } from "@/components/calendar/CalendarContent";
import { useAllEmployeeShifts } from "@/contexts/timeManagement/hooks/useAllEmployeeShifts";

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
  
  // State for calendar view
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "team">("month");
  
  // Fetch all employee shifts to ensure we have data for the calendar
  const { refreshShifts } = useAllEmployeeShifts();
  
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

  // Handle calendar navigation
  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  return (
    <>
      <ErrorAlertBar error={error} messagesError={messagesError} onRetry={handleRetry} />
      <DebugPanel />
      
      {/* Dashboard-style calendar at the top */}
      <div className="mb-4">
        <CalendarContent 
          date={selectedDate}
          currentMonth={currentMonth}
          viewMode={viewMode}
          currentUser={currentUser}
          onDateSelect={handleDateSelect}
          onViewModeChange={setViewMode}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          clickable={true}
          viewAllUrl="/time?tab=work-schedules"
        />
      </div>
      
      <Tabs value={activeTab} className="mt-4">
        <TabNavigation isAdmin={isAdmin} />
        <TabContent currentUser={currentUser} isAdmin={isAdmin} />
      </Tabs>
    </>
  );
};
