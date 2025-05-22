
import React, { useCallback, useRef } from "react";
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
  const lastTabChange = useRef<number>(0);

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
    // Skip if we're already on this tab
    if (value === activeTab) {
      console.log(`Already on tab ${value}, skipping change`);
      return;
    }
    
    // Prevent rapid tab switching (add throttling)
    const now = Date.now();
    if (now - lastTabChange.current < 1000) {
      console.log(`Tab change throttled, too soon since last change`);
      return;
    }
    
    console.log(`Tab changing from ${activeTab} to ${value}`);
    lastTabChange.current = now;
    
    setActiveTab(value);
    
    // Update URL query parameter
    const params = new URLSearchParams(location.search);
    params.set('tab', value);
    navigate(`/time?${params.toString()}`, { replace: true });
    
    // Only refresh data for certain tabs and not too frequently
    if (value === "shift-coverage") {
      // Delay refresh to prevent navigation loop
      setTimeout(() => {
        console.log("Refreshing shift coverage data after delay");
        forceRefreshData();
      }, 1000);
    } else if (value === "my-requests") {
      // Delay refresh to prevent navigation loop
      setTimeout(() => {
        console.log("Refreshing time-off requests data after delay");
        fetchRequests();
      }, 1000);
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
