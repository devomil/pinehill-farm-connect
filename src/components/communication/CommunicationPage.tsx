
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CommunicationTabs } from "./CommunicationPageTabs";
import { AnnouncementManager } from "./announcement/AnnouncementManager";
import { EmployeeCommunications } from "../communications/EmployeeCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { CommunicationHeader } from "./CommunicationHeader";
import { useCommunications } from "@/hooks/useCommunications";
import { toast } from "sonner";
import { CommunicationDebugHelper } from "./CommunicationDebugHelper";

const CommunicationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for debug panel
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  
  // Check URL for active tab
  const isMessagesTab = location.search.includes('tab=messages');
  const [activeTab, setActiveTab] = useState<string>(isMessagesTab ? "messages" : "announcements");
  
  // Get unread messages for the badge counter
  const { unreadMessages, refreshMessages } = useCommunications();
  const { unfilteredEmployees, refetch: refetchEmployees } = useEmployeeDirectory();
  
  // Determine if the current user is an admin
  const isAdmin = currentUser?.role === 'admin';
  
  // Use refs to track refresh timers and prevent duplicate refreshes
  const initialDataLoaded = useRef<boolean>(false);
  const lastRefreshTime = useRef<number>(Date.now());
  const refreshTimeoutRef = useRef<number | null>(null);
  const isPageMounted = useRef<boolean>(false);
  const isRefreshing = useRef<boolean>(false);
  const navigationComplete = useRef<boolean>(false);

  // Log component renders
  console.log("CommunicationPage rendering with activeTab:", activeTab, "URL:", location.pathname + location.search);

  // Handle tab changes and update the URL
  const handleTabChange = useCallback((value: string) => {
    console.log(`Tab changing from ${activeTab} to ${value}`);
    setActiveTab(value);
    navigationComplete.current = false;
    
    const newPath = value === "messages" 
      ? '/communication?tab=messages' 
      : '/communication';
      
    // Update URL without full page reload
    if (location.pathname + location.search !== newPath) {
      navigate(newPath, { replace: true });
      
      // Only refresh if it's been more than 5 seconds since last refresh
      const now = Date.now();
      if (now - lastRefreshTime.current > 5000 && !isRefreshing.current) {
        console.log("Refreshing messages on tab change");
        isRefreshing.current = true;
        refreshMessages().finally(() => {
          isRefreshing.current = false;
          lastRefreshTime.current = Date.now();
          navigationComplete.current = true;
        });
      } else {
        navigationComplete.current = true;
      }
    }
  }, [navigate, refreshMessages, activeTab, location.pathname, location.search]);

  // Handle URL changes - update active tab based on URL
  useEffect(() => {
    if (!navigationComplete.current) {
      console.log("Handling URL change:", location.search);
      
      // Update active tab based on URL
      if (location.search.includes('tab=messages') && activeTab !== "messages") {
        console.log("URL indicates messages tab, updating active tab");
        setActiveTab("messages");
      } else if (!location.search.includes('tab=messages') && activeTab !== "announcements") {
        console.log("URL indicates announcements tab, updating active tab");
        setActiveTab("announcements");
      }
      
      navigationComplete.current = true;
    }
  }, [location.search, activeTab, navigate]);

  // Initial data load - only once when component is mounted
  useEffect(() => {
    isPageMounted.current = true;
    
    if (!initialDataLoaded.current && currentUser) {
      console.log("CommunicationPage mounted, initial data load");
      isRefreshing.current = true;
      
      // Use Promise.all to load data in parallel
      Promise.all([
        refreshMessages(),
        refetchEmployees()
      ]).then(() => {
        if (isPageMounted.current) {
          initialDataLoaded.current = true;
          console.log("Initial communication data loaded");
          lastRefreshTime.current = Date.now();
        }
      }).catch(err => {
        console.error("Error loading initial communication data:", err);
      }).finally(() => {
        isRefreshing.current = false;
      });
    }
    
    // Clear any previous refresh timeouts when unmounting
    return () => {
      isPageMounted.current = false;
      isRefreshing.current = false;
      if (refreshTimeoutRef.current !== null) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [refreshMessages, refetchEmployees, currentUser]);
  
  // Handle announcement creation
  const handleAnnouncementCreate = useCallback(() => {
    console.log("Announcement created, refreshing data");
    toast.success("Announcement created successfully");
    
    // Prevent concurrent refreshes
    if (!isRefreshing.current) {
      isRefreshing.current = true;
      setTimeout(() => {
        if (isPageMounted.current) {
          refreshMessages().finally(() => {
            isRefreshing.current = false;
            lastRefreshTime.current = Date.now();
          });
        }
      }, 1000);
    }
  }, [refreshMessages]);
  
  // Handle manual refresh of data - explicitly requested by user
  const handleManualRefresh = useCallback(() => {
    console.log("Manual refresh requested");
    
    // Prevent multiple concurrent refreshes
    if (isRefreshing.current) {
      toast.info("Refresh already in progress...");
      return;
    }
    
    // Prevent refreshes that happen too quickly
    const now = Date.now();
    if (now - lastRefreshTime.current < 3000) {
      toast.info("Please wait a moment before refreshing again");
      return;
    }
    
    if (refreshTimeoutRef.current !== null) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    toast.info("Refreshing data...");
    isRefreshing.current = true;
    
    // Use Promise.all to load all data in parallel
    Promise.all([
      refreshMessages(),
      refetchEmployees()
    ]).then(() => {
      if (isPageMounted.current) {
        toast.success("Data refreshed successfully");
        lastRefreshTime.current = Date.now();
      }
    }).catch(err => {
      console.error("Error refreshing communication data:", err);
      toast.error("Failed to refresh data");
    }).finally(() => {
      isRefreshing.current = false;
    });
  }, [refreshMessages, refetchEmployees]);
  
  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <CommunicationHeader 
        isAdmin={isAdmin}
        allEmployees={unfilteredEmployees || []}
        onAnnouncementCreate={handleAnnouncementCreate}
        onManualRefresh={handleManualRefresh}
        showDebugInfo={showDebugInfo}
        setShowDebugInfo={setShowDebugInfo}
      />
      
      <CommunicationTabs 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        unreadMessages={unreadMessages}
      />
      
      {activeTab === "announcements" && (
        <AnnouncementManager 
          currentUser={currentUser}
          allEmployees={unfilteredEmployees || []}
          isAdmin={isAdmin}
        />
      )}
      
      {activeTab === "messages" && (
        <EmployeeCommunications />
      )}
      
      <CommunicationDebugHelper
        showDebug={showDebugInfo}
        activeTab={activeTab}
        unreadMessages={unreadMessages || []}
        onTabChange={handleTabChange}
        onRefresh={handleManualRefresh}
      />
    </div>
  );
};

export default CommunicationPage;
