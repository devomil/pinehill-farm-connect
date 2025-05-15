
import React, { useEffect } from "react";
import { CommunicationDebugHelper } from "./CommunicationDebugHelper";
import { useCommunicationPageData } from "@/hooks/communications/useCommunicationPageData";
import { useTabNavigation } from "@/hooks/communications/useTabNavigation";
import { useDebug } from "@/hooks/useDebug";
import { useMessageTabDebugger } from "@/hooks/communications/useMessageTabDebugger";
import { useNavigationDebugger } from "@/hooks/communications/useNavigationDebugger";
import { useNavigationRecovery } from "@/hooks/communications/useNavigationRecovery";
import { ErrorBoundary } from "@/components/debug/ErrorBoundary";
import { DebugProvider } from "@/components/debug/DebugProvider";
import { DiagnosticsPanel } from "@/components/debug/DiagnosticsPanel";
import { CommunicationPageHeader } from "./CommunicationPageHeader";
import { CommunicationPageContent } from "./CommunicationPageContent";
import { NavigationWarning } from "./NavigationWarning";
import { RouteDebugger } from "@/components/debug/RouteDebugger";
import { toast } from "sonner";

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
  
  // Use the navigation debugger to detect navigation issues
  const navigationDebugger = useNavigationDebugger();
  
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

  // Use the navigation recovery hook to handle URL parameters and recovery
  useNavigationRecovery({
    activeTab,
    setActiveTab,
    navigationComplete,
    refreshMessages,
    navigationInProgress,
    showDebugInfo,
    setShowDebugInfo
  });

  // Log component renders - using our debugging system
  debug.info("CommunicationPage rendering", {
    activeTab, 
    url: location.pathname + location.search,
    unreadMessageCount: unreadMessages?.length,
    employeeCount: unfilteredEmployees?.length,
    isAdmin,
    navigationInProgress: navigationInProgress?.current,
    navLoopDetected: navigationDebugger.hasLoopDetected,
    timeInMessagesTab: navigationDebugger.timeInMessagesTab
  });
  
  // Automatically show debug info when loop detected
  React.useEffect(() => {
    if (navigationDebugger.hasLoopDetected && !showDebugInfo) {
      setShowDebugInfo(true);
      toast.error("Navigation issue detected", {
        description: "Debug information has been enabled",
        duration: 5000
      });
    }
  }, [navigationDebugger.hasLoopDetected, showDebugInfo, setShowDebugInfo]);
  
  return (
    <DebugProvider>
      <ErrorBoundary componentName="CommunicationPage">
        <div className="container mx-auto py-6 max-w-6xl">
          <CommunicationPageHeader 
            isAdmin={isAdmin}
            unfilteredEmployees={unfilteredEmployees || []}
            onAnnouncementCreate={handleAnnouncementCreate}
            onManualRefresh={handleManualRefresh}
            showDebugInfo={showDebugInfo}
            setShowDebugInfo={setShowDebugInfo}
          />
          
          <NavigationWarning 
            hasLoopDetected={navigationDebugger.hasLoopDetected}
            attemptRecovery={navigationDebugger.attemptRecovery}
          />
          
          <RouteDebugger />
          
          <CommunicationPageContent
            activeTab={activeTab}
            onTabChange={handleTabChange}
            unreadMessages={unreadMessages || []}
            currentUser={currentUser}
            unfilteredEmployees={unfilteredEmployees || []}
            isAdmin={isAdmin}
          />
          
          {/* Always show debug helper in loop detection mode, otherwise respect user setting */}
          {(showDebugInfo || navigationDebugger.hasLoopDetected) && (
            <CommunicationDebugHelper
              showDebug={true}
              activeTab={activeTab}
              unreadMessages={unreadMessages || []}
              onTabChange={handleTabChange}
              onRefresh={handleManualRefresh}
              navigationInProgress={navigationInProgress?.current}
              messageTabInfo={messageDebugger.debugInfo}
              navigationDebugInfo={{
                switchCount: navigationDebugger.tabSwitchCount,
                timeInTab: navigationDebugger.timeInMessagesTab,
                loopDetected: navigationDebugger.hasLoopDetected
              }}
            />
          )}
          
          {/* Global diagnostics panel */}
          <DiagnosticsPanel />
        </div>
      </ErrorBoundary>
    </DebugProvider>
  );
};

export default CommunicationPage;
