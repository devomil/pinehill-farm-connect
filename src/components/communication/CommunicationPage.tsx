
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CommunicationTabs } from "./CommunicationPageTabs";
import { CommunicationHeader } from "./CommunicationHeader";
import { CommunicationDebugHelper } from "./CommunicationDebugHelper";
import { CommunicationContent } from "./CommunicationContent";
import { useCommunicationPageData } from "@/hooks/communications/useCommunicationPageData";
import { useTabNavigation } from "@/hooks/communications/useTabNavigation";
import { useDebug } from "@/hooks/useDebug";
import { useMessageTabDebugger } from "@/hooks/communications/useMessageTabDebugger";
import ErrorBoundary from "@/components/debug/ErrorBoundary";
import { DebugProvider } from "@/components/debug/DebugProvider";
import { toast } from "sonner";
import { DebugButton } from "@/components/debug/DebugButton";

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
  
  const { handleTabChange, navigationInProgress } = useTabNavigation({
    activeTab,
    setActiveTab,
    location,
    navigationComplete,
    refreshMessages,
    isRefreshing,
    lastRefreshTime
  });

  // Connect the message tab debugger - it will only be active when on the messages tab
  const messageDebugger = useMessageTabDebugger(activeTab === 'messages');

  // Log component renders - using our debugging system
  debug.info("CommunicationPage rendering", {
    activeTab, 
    url: location.pathname + location.search,
    unreadMessageCount: unreadMessages?.length,
    employeeCount: unfilteredEmployees?.length,
    isAdmin,
    navigationInProgress: navigationInProgress?.current
  });

  // Effect to sync the URL with the active tab on mount and location changes
  useEffect(() => {
    // Only run this effect if navigation is complete to prevent loops
    if (!navigationComplete.current) {
      debug.info("Skipping URL sync, navigation in progress");
      return;
    }
    
    // Parse URL parameters and update active tab if needed
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    const newTab = tabParam === 'messages' ? "messages" : "announcements";
    
    if (newTab !== activeTab) {
      debug.info("Syncing tab from URL", { urlTab: newTab, currentTab: activeTab });
      setActiveTab(newTab);
      
      // If switching to messages tab via direct URL, ensure messages are refreshed
      if (newTab === 'messages' && !navigationInProgress?.current) {
        debug.info("Direct URL navigation to messages tab, refreshing data");
        refreshMessages().catch(err => {
          console.error("Error refreshing messages during URL sync:", err);
          toast.error("Failed to load messages");
        });
      }
    }
  }, [location, debug, activeTab, setActiveTab, navigationComplete, refreshMessages, navigationInProgress]);
  
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
          
          <div className="flex justify-end mb-4">
            <DebugButton variant="outline" className="text-xs" />
          </div>
          
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
              navigationInProgress={navigationInProgress?.current}
              messageTabInfo={messageDebugger.debugInfo}
            />
          )}
        </div>
      </ErrorBoundary>
    </DebugProvider>
  );
};

export default CommunicationPage;
