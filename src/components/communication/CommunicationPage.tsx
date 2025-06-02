import React, { useEffect } from "react";
import { CommunicationDebugHelper } from "./CommunicationDebugHelper";
import { useCommunicationPageData } from "@/hooks/communications/useCommunicationPageData";
import { useSimplifiedTabNavigation } from "@/hooks/communications/useSimplifiedTabNavigation";
import { useDebug } from "@/hooks/useDebug";
import { useNavigationDebugger } from "@/hooks/communications/useNavigationDebugger";
import { EmergencyNavigationReset } from "./EmergencyNavigationReset";
import ErrorBoundary from "@/components/debug/ErrorBoundary";
import { DebugProvider } from "@/components/debug/DebugProvider";
import { DiagnosticsPanel } from "@/components/debug/DiagnosticsPanel";
import { CommunicationPageHeader } from "./CommunicationPageHeader";
import { CommunicationPageContent } from "./CommunicationPageContent";
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
  
  // Use simplified navigation to prevent loops
  const { handleTabChange, isNavigating, resetNavigation } = useSimplifiedTabNavigation(
    activeTab,
    setActiveTab
  );
  
  // Keep navigation debugger for monitoring
  const navigationDebugger = useNavigationDebugger();
  
  // Lower emergency threshold - trigger at 50 tab switches OR when loop detected
  const isEmergency = navigationDebugger.tabSwitchCount >= 50 || navigationDebugger.hasLoopDetected;
  
  debug.info("CommunicationPage rendering", {
    activeTab, 
    url: location.pathname + location.search,
    unreadMessageCount: unreadMessages?.length,
    employeeCount: unfilteredEmployees?.length,
    isAdmin,
    isNavigating,
    tabSwitchCount: navigationDebugger.tabSwitchCount,
    rapidNavigationCount: navigationDebugger.rapidNavigationCount,
    hasLoopDetected: navigationDebugger.hasLoopDetected,
    isEmergency
  });
  
  // Auto-show debug info during emergency
  useEffect(() => {
    if (isEmergency && !showDebugInfo) {
      setShowDebugInfo(true);
      toast.error("Navigation emergency detected", {
        description: "Debug information enabled automatically",
        duration: 10000
      });
    }
  }, [isEmergency, showDebugInfo, setShowDebugInfo]);
  
  return (
    <DebugProvider>
      <ErrorBoundary componentName="CommunicationPage">
        <div className="w-full">
          {/* Show emergency reset if critical loop detected */}
          {isEmergency && (
            <EmergencyNavigationReset 
              onReset={resetNavigation}
              switchCount={navigationDebugger.tabSwitchCount}
            />
          )}
          
          {!isEmergency && (
            <>
              <CommunicationPageHeader 
                isAdmin={isAdmin}
                unfilteredEmployees={unfilteredEmployees || []}
                onAnnouncementCreate={handleAnnouncementCreate}
                onManualRefresh={handleManualRefresh}
                showDebugInfo={showDebugInfo}
                setShowDebugInfo={setShowDebugInfo}
              />
              
              <CommunicationPageContent
                activeTab={activeTab}
                onTabChange={handleTabChange}
                unreadMessages={unreadMessages || []}
                currentUser={currentUser}
                unfilteredEmployees={unfilteredEmployees || []}
                isAdmin={isAdmin}
              />
            </>
          )}
          
          {/* Always show debug helper when emergency or debug mode enabled */}
          {(showDebugInfo || isEmergency) && (
            <CommunicationDebugHelper
              showDebug={true}
              activeTab={activeTab}
              unreadMessages={unreadMessages || []}
              onTabChange={handleTabChange}
              onRefresh={handleManualRefresh}
              navigationInProgress={isNavigating}
              navigationDebugInfo={{
                switchCount: navigationDebugger.tabSwitchCount,
                timeInTab: navigationDebugger.timeInMessagesTab,
                loopDetected: navigationDebugger.hasLoopDetected,
                circuitBreakerActive: isEmergency
              }}
            />
          )}
          
          <DiagnosticsPanel />
        </div>
      </ErrorBoundary>
    </DebugProvider>
  );
};

export default CommunicationPage;
