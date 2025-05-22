
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTimeManagement } from "@/contexts/timeManagement";
import { useTabNavigation } from "@/hooks/time-management/useTabNavigation";

interface TabNavigationProps {
  isAdmin: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ isAdmin }) => {
  const { activeTab, setActiveTab, forceRefreshData, fetchRequests } = useTimeManagement();
  
  // Use our custom hook for tab navigation logic
  const { handleTabChange } = useTabNavigation(
    activeTab,
    setActiveTab,
    forceRefreshData,
    fetchRequests
  );

  return (
    <TabsList className="mb-4">
      <TabsTrigger 
        value="my-requests" 
        onClick={() => handleTabChange("my-requests")}
        className="pointer-events-auto"
      >
        My Requests
      </TabsTrigger>
      <TabsTrigger 
        value="shift-coverage" 
        onClick={() => handleTabChange("shift-coverage")}
        className="pointer-events-auto"
      >
        Shift Coverage
      </TabsTrigger>
      {isAdmin && (
        <TabsTrigger 
          value="pending-approvals" 
          onClick={() => handleTabChange("pending-approvals")}
          className="pointer-events-auto"
        >
          Pending Approvals
        </TabsTrigger>
      )}
      <TabsTrigger 
        value="team-calendar" 
        onClick={() => handleTabChange("team-calendar")}
        className="pointer-events-auto"
      >
        Calendar
      </TabsTrigger>
      <TabsTrigger 
        value="work-schedules" 
        onClick={() => handleTabChange("work-schedules")}
        className="pointer-events-auto"
      >
        Work Schedules
      </TabsTrigger>
    </TabsList>
  );
};
