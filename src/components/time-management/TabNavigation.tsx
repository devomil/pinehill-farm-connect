
import React, { useCallback, useRef } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTimeManagement } from "@/contexts/timeManagement";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface TabNavigationProps {
  isAdmin: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ isAdmin }) => {
  const { activeTab, setActiveTab, forceRefreshData, fetchRequests } = useTimeManagement();
  const location = useLocation();
  const navigate = useNavigate();
  const lastTabChange = useRef<number>(0);
  const pendingRefreshTimeoutRef = useRef<number | null>(null);
  const toastIdRef = useRef<string | null>(null);

  // Handle URL query parameters for direct navigation
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    
    if (tabFromUrl && activeTab !== tabFromUrl) {
      console.log(`Setting tab from URL: ${tabFromUrl}`);
      setActiveTab(tabFromUrl);
    }
    
    // Clear any active toast when URL changes
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
    
    return () => {
      // Clean up any pending timeouts
      if (pendingRefreshTimeoutRef.current !== null) {
        clearTimeout(pendingRefreshTimeoutRef.current);
        pendingRefreshTimeoutRef.current = null;
      }
    };
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
    
    // Clear any pending refresh timeout
    if (pendingRefreshTimeoutRef.current !== null) {
      clearTimeout(pendingRefreshTimeoutRef.current);
      pendingRefreshTimeoutRef.current = null;
    }
    
    setActiveTab(value);
    
    // Update URL query parameter
    const params = new URLSearchParams(location.search);
    params.set('tab', value);
    navigate(`/time?${params.toString()}`, { replace: true });
    
    // Only refresh data for certain tabs and not too frequently
    if (value === "shift-coverage") {
      // Clear any existing toast
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      
      // Delay refresh to prevent navigation loop
      pendingRefreshTimeoutRef.current = window.setTimeout(() => {
        console.log("Refreshing shift coverage data after delay");
        forceRefreshData();
        pendingRefreshTimeoutRef.current = null;
      }, 1000) as unknown as number;
    } else if (value === "my-requests") {
      // Clear any existing toast
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      
      // Delay refresh to prevent navigation loop
      pendingRefreshTimeoutRef.current = window.setTimeout(() => {
        console.log("Refreshing time-off requests data after delay");
        fetchRequests();
        pendingRefreshTimeoutRef.current = null;
      }, 1000) as unknown as number;
    }
  }, [activeTab, setActiveTab, forceRefreshData, fetchRequests, location.search, navigate]);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      // Clear any pending timeouts
      if (pendingRefreshTimeoutRef.current !== null) {
        clearTimeout(pendingRefreshTimeoutRef.current);
      }
      
      // Clear any active toast
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    };
  }, []);

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
