
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CommunicationTabs } from "./CommunicationPageTabs";
import { CommunicationHeader } from "./CommunicationHeader";
import { CommunicationDebugHelper } from "./CommunicationDebugHelper";
import { CommunicationContent } from "./CommunicationContent";
import { useCommunicationPageData } from "@/hooks/communications/useCommunicationPageData";
import { useTabNavigation } from "@/hooks/communications/useTabNavigation";
import { useDebug } from "@/hooks/useDebug";
import ErrorBoundary from "@/components/debug/ErrorBoundary";
import { DebugProvider } from "@/components/debug/DebugProvider";

const CommunicationPage: React.FC = () => {
  // Setup component debugging
  const debug = useDebug('CommunicationPage', {
    trackRenders: true,
    logStateChanges: true,
    traceLifecycle: true
  });
  
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

  // Log component renders - using our new debugging system
  debug.info("CommunicationPage rendering", {
    activeTab, 
    url: location.pathname + location.search,
    unreadMessageCount: unreadMessages?.length,
    employeeCount: unfilteredEmployees?.length,
    isAdmin
  });

  // Enable this for debugging tab navigation issues
  useEffect(() => {
    debug.info("activeTab changed", { 
      newActiveTab: activeTab,
      location: location.pathname + location.search
    });
  }, [activeTab, debug, location]);
  
  return (
    <DebugProvider>
      <ErrorBoundary componentName="CommunicationPage">
        <div className="container mx-auto py-6 max-w-6xl">
          <CommunicationHeader 
            isAdmin={isAdmin}
            allEmployees={unfilteredEmployees || []}
            onAnnouncementCreate={handleAnnouncementCreate}
            onManualRefresh={handleManualRefresh}
            showDebugInfo={showDebugInfo}
            setShowDebugInfo={setShowDebugInfo}
          />
          
          <ErrorBoundary componentName="CommunicationTabs">
            <CommunicationTabs 
              activeTab={activeTab} 
              onTabChange={handleTabChange} 
              unreadMessages={unreadMessages}
            />
          </ErrorBoundary>
          
          <ErrorBoundary componentName="CommunicationContent">
            <CommunicationContent
              activeTab={activeTab}
              currentUser={currentUser}
              unfilteredEmployees={unfilteredEmployees || []}
              isAdmin={isAdmin}
            />
          </ErrorBoundary>
          
          {showDebugInfo && (
            <CommunicationDebugHelper
              showDebug={showDebugInfo}
              activeTab={activeTab}
              unreadMessages={unreadMessages || []}
              onTabChange={handleTabChange}
              onRefresh={handleManualRefresh}
            />
          )}
        </div>
      </ErrorBoundary>
    </DebugProvider>
  );
};

export default CommunicationPage;
