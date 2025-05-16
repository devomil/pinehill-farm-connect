
import React, { useCallback } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTimeManagement } from "@/contexts/timeManagement";
import { useLocation } from "react-router-dom";

interface TabNavigationProps {
  isAdmin: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ isAdmin }) => {
  const { activeTab, setActiveTab, forceRefreshData, fetchRequests } = useTimeManagement();
  const location = useLocation();

  // Handle URL query parameters for direct navigation
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    
    if (tabFromUrl && activeTab !== tabFromUrl) {
      console.log(`Setting tab from URL: ${tabFromUrl}`);
      setActiveTab(tabFromUrl);
    }
  }, [location.search, setActiveTab, activeTab]);

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
      } else if (value === "team-calendar") {
        console.log("Refreshing data for team calendar view");
        forceRefreshData();
      }
    }
  }, [activeTab, setActiveTab, forceRefreshData, fetchRequests]);

  return (
    <TabsList className="mb-4">
      <TabsTrigger value="my-requests" onClick={() => handleTabChange("my-requests")}>
        My Requests
      </TabsTrigger>
      <TabsTrigger value="shift-coverage" onClick={() => handleTabChange("shift-coverage")}>
        Shift Coverage
      </TabsTrigger>
      {isAdmin && (
        <TabsTrigger value="pending-approvals" onClick={() => handleTabChange("pending-approvals")}>
          Pending Approvals
        </TabsTrigger>
      )}
      <TabsTrigger value="team-calendar" onClick={() => handleTabChange("team-calendar")}>
        Calendar
      </TabsTrigger>
      <TabsTrigger value="work-schedules" onClick={() => handleTabChange("work-schedules")}>
        Work Schedules
      </TabsTrigger>
    </TabsList>
  );
};
