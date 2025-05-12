
import React, { useState, useEffect, useCallback } from "react";
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

  // Handle tab changes and update the URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "messages") {
      navigate('/communication?tab=messages');
      // Force refresh messages when switching to messages tab
      refreshMessages();
      
      // For admin users, do multiple refreshes with delays to ensure counts are updated
      if (isAdmin) {
        setTimeout(() => refreshMessages(), 700);
        setTimeout(() => refreshMessages(), 2000);
      }
    } else {
      navigate('/communication');
    }
  };

  // Handle URL changes
  useEffect(() => {
    if (location.search.includes('tab=messages')) {
      setActiveTab("messages");
    } else {
      setActiveTab("announcements");
    }
  }, [location]);

  // Make sure we refresh unread messages when the component mounts
  useEffect(() => {
    console.log("CommunicationPage mounted, refreshing messages");
    refreshMessages();
    
    // Refresh again after a brief delay to catch any updates
    const timer = setTimeout(() => refreshMessages(), 1000);
    
    return () => clearTimeout(timer);
  }, [refreshMessages]);
  
  // Special effect for when viewing the messages tab to reset badge counters
  useEffect(() => {
    if (activeTab === "messages" && isAdmin) {
      console.log("Admin user viewing messages tab, aggressively refreshing counters");
      refreshMessages();
      
      // Multiple refreshes with delays for admin users to ensure counts are updated
      const timerOne = setTimeout(() => refreshMessages(), 800);
      const timerTwo = setTimeout(() => refreshMessages(), 2000);
      
      return () => {
        clearTimeout(timerOne);
        clearTimeout(timerTwo);
      };
    }
  }, [activeTab, isAdmin, refreshMessages]);
  
  // Handle announcement creation
  const handleAnnouncementCreate = () => {
    console.log("Announcement created, refreshing data");
    // Add any specific logic here if needed
  };
  
  // Handle manual refresh of data
  const handleManualRefresh = useCallback(() => {
    console.log("Manual refresh requested");
    refreshMessages();
    
    // For admin users, do multiple refreshes with delays
    if (isAdmin) {
      setTimeout(() => refreshMessages(), 1000);
    }
  }, [refreshMessages, isAdmin]);
  
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
