
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CommunicationTabs } from "./CommunicationPageTabs";
import { AnnouncementManager } from "./announcement/AnnouncementManager";
import { EmployeeCommunications } from "../communications/EmployeeCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { CommunicationHeader } from "./CommunicationHeader";
import { useCommunications } from "@/hooks/useCommunications";

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
  const { unfilteredEmployees } = useEmployeeDirectory();
  
  // Determine if the current user is an admin
  const isAdmin = currentUser?.role === 'admin';
  
  // Use refs to track refresh timers and prevent duplicate refreshes
  const initialDataLoaded = useRef<boolean>(false);
  const lastRefreshTime = useRef<number>(Date.now());
  const refreshTimeoutRef = useRef<number | null>(null);
  const stableLocationPathRef = useRef<string>(location.pathname);
  const stableSearchRef = useRef<string>(location.search);

  // Handle tab changes and update the URL
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    if (value === "messages") {
      navigate('/communication?tab=messages', { replace: true });
      
      // Only refresh if it's been more than 5 seconds since last refresh
      const now = Date.now();
      if (now - lastRefreshTime.current > 5000) {
        console.log("Refreshing messages on tab change");
        refreshMessages();
        lastRefreshTime.current = now;
      }
    } else {
      navigate('/communication', { replace: true });
    }
  }, [navigate, refreshMessages]);

  // Handle URL changes - use refs to track stable values
  useEffect(() => {
    // Only update if we're still on the communication page to prevent navigation issues
    if (location.pathname === '/communication') {
      stableLocationPathRef.current = location.pathname;
      stableSearchRef.current = location.search;
      
      if (location.search.includes('tab=messages')) {
        setActiveTab("messages");
      } else {
        setActiveTab("announcements");
      }
    }
  }, [location.pathname, location.search]);

  // Initial data load - only once
  useEffect(() => {
    if (!initialDataLoaded.current && currentUser) {
      console.log("CommunicationPage mounted, initial data load");
      refreshMessages();
      initialDataLoaded.current = true;
    }
    
    // Clear any previous refresh timeouts when unmounting
    return () => {
      if (refreshTimeoutRef.current !== null) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [refreshMessages, currentUser]);
  
  // Handle announcement creation
  const handleAnnouncementCreate = useCallback(() => {
    console.log("Announcement created, refreshing data");
    // We can safely refresh here since it's an explicit user action
    setTimeout(() => refreshMessages(), 1000);
  }, [refreshMessages]);
  
  // Handle manual refresh of data - explicitly requested by user
  const handleManualRefresh = useCallback(() => {
    console.log("Manual refresh requested");
    refreshMessages();
    lastRefreshTime.current = Date.now();
  }, [refreshMessages]);
  
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
    </div>
  );
};

export default CommunicationPage;
