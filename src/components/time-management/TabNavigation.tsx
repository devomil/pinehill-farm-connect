
import React, { useCallback } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTimeManagement } from "@/contexts/timeManagement";
import { useLocation, useNavigate } from "react-router-dom";

interface TabNavigationProps {
  isAdmin: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ isAdmin }) => {
  const { activeTab, setActiveTab, forceRefreshData, fetchRequests } = useTimeManagement();
  const location = useLocation();
  const navigate = useNavigate();

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
      
      // Update URL query parameter
      const params = new URLSearchParams(location.search);
      params.set('tab', value);
      navigate(`/time?${params.toString()}`, { replace: true });
      
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
      } else if (value === "work-schedules") {
        console.log("Navigating to work schedules view");
        forceRefreshData();
      }
    }
  }, [activeTab, setActiveTab, forceRefreshData, fetchRequests, location.search, navigate]);

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
