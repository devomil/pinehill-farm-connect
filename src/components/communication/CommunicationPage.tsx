
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CommunicationTabs } from "./CommunicationPageTabs";
import { CommunicationHeader } from "./CommunicationHeader";
import { CommunicationDebugHelper } from "./CommunicationDebugHelper";
import { CommunicationContent } from "./CommunicationContent";
import { useCommunicationPageData } from "@/hooks/communications/useCommunicationPageData";
import { useTabNavigation } from "@/hooks/communications/useTabNavigation";

const CommunicationPage: React.FC = () => {
  const {
    currentUser,
    showDebugInfo,
    setShowDebugInfo,
    activeTab,
    setActiveTab,
    unreadMessages,
    unfilteredEmployees,
    isAdmin,
    handleAnnouncementCreate,
    handleManualRefresh,
    location,
    navigationComplete,
    isRefreshing,
    lastRefreshTime,
    refreshMessages
  } = useCommunicationPageData();
  
  const { handleTabChange } = useTabNavigation({
    activeTab,
    setActiveTab,
    location,
    navigationComplete,
    refreshMessages,
    isRefreshing,
    lastRefreshTime
  });

  // Log component renders
  console.log("CommunicationPage rendering with activeTab:", activeTab, "URL:", location.pathname + location.search);

  // Handle URL changes - update active tab based on URL
  useEffect(() => {
    // Update tab when URL changes, ensuring proper synchronization
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam === 'messages' && activeTab !== "messages") {
      console.log("URL indicates messages tab, updating active tab");
      setActiveTab("messages");
    } else if (!tabParam && activeTab !== "announcements") {
      console.log("URL indicates announcements tab, updating active tab");
      setActiveTab("announcements");
    }
    
    navigationComplete.current = true;
  }, [location.search, activeTab, setActiveTab, navigationComplete]);
  
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
      
      <CommunicationContent
        activeTab={activeTab}
        currentUser={currentUser}
        unfilteredEmployees={unfilteredEmployees || []}
        isAdmin={isAdmin}
      />
      
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
