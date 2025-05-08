
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { AnnouncementManager } from "@/components/communication/announcement/AnnouncementManager";
import { useCommunications } from "@/hooks/useCommunications";
import { EmployeeCommunications } from "@/components/communications/EmployeeCommunications";
import { Card } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CommunicationHeader } from "./CommunicationHeader";
import { CommunicationErrorDisplay } from "./CommunicationErrorDisplay";
import { CommunicationDebugPanel } from "./CommunicationDebugPanel";
import { CommunicationTabs } from "./CommunicationPageTabs";
import { useDashboardData } from "@/hooks/useDashboardData";

const CommunicationPage = () => {
  const { currentUser } = useAuth();
  const { unfilteredEmployees: allEmployees, loading: employeesLoading, refetch: refetchEmployees, error: employeeError } = useEmployeeDirectory();
  const { unreadMessages, refreshMessages, error: messagesError } = useCommunications(true);
  const { refetchData: refreshDashboardData } = useDashboardData();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get tab from URL params
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get("tab") || "announcements";
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl);
  const [retryCount, setRetryCount] = useState(0);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  useEffect(() => {
    // Set active tab based on URL parameter
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);
  
  useEffect(() => {
    console.log("Communication page loaded - currentUser:", currentUser);
    console.log("Communication page - allEmployees:", allEmployees?.length || 0);
    console.log("Communication page - employeesLoading:", employeesLoading);
    console.log("Communication page - employeeError:", employeeError ? 
      (typeof employeeError === 'string' ? employeeError : employeeError.message || 'Unknown error') : 'None');
    console.log("Communication page - messagesError:", messagesError ?
      (typeof messagesError === 'string' ? messagesError : messagesError.message || 'Unknown error') : 'None');
    
    // Always fetch employees on page load to ensure we have the latest data
    if (!allEmployees || allEmployees.length === 0) {
      console.log("No employees found, fetching now");
      refetchEmployees();
    }
    
    // Refresh all data when the page loads
    refreshMessages();
    refreshDashboardData();
    
  }, [currentUser, allEmployees, refreshMessages, refetchEmployees, refreshDashboardData, employeeError, messagesError, employeesLoading]);

  const isAdmin = currentUser?.role === "admin" || currentUser?.id === "00000000-0000-0000-0000-000000000001";

  const handleAnnouncementCreate = () => {
    console.log("Announcement created, refreshing...");
    refreshMessages();
    refreshDashboardData();
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL to reflect active tab without reloading the page
    const newSearchParams = new URLSearchParams(location.search);
    if (value === "announcements") {
      newSearchParams.delete("tab");
    } else {
      newSearchParams.set("tab", value);
    }
    navigate({
      pathname: location.pathname,
      search: newSearchParams.toString()
    }, { replace: true });
    
    // Refresh data when switching tabs
    refreshMessages();
    refreshDashboardData();
  };
  
  // Handle manual refresh of all data
  const handleManualRefresh = () => {
    toast.info("Refreshing all communication data");
    refetchEmployees();
    refreshMessages();
    refreshDashboardData();
    setRetryCount(prev => prev + 1);
  };
  
  // Are there any errors to display?
  const hasErrors = employeeError || messagesError;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {hasErrors && (
          <CommunicationErrorDisplay
            error={employeeError || messagesError}
            onRefresh={handleManualRefresh}
          />
        )}
        
        {/* Header Area */}
        <CommunicationHeader
          isAdmin={isAdmin}
          allEmployees={allEmployees || []}
          onAnnouncementCreate={handleAnnouncementCreate}
          loading={employeesLoading}
          onManualRefresh={handleManualRefresh}
          showDebugInfo={showDebugInfo}
          setShowDebugInfo={setShowDebugInfo}
        />
        
        {/* Debug Panel */}
        {showDebugInfo && (
          <CommunicationDebugPanel
            activeTab={activeTab}
            employeesLoading={employeesLoading}
            employeeCount={allEmployees?.length || 0}
            unreadMessageCount={unreadMessages?.length || 0}
            retryCount={retryCount}
            currentUser={currentUser}
            isAdmin={isAdmin}
            employeeError={employeeError}
            messagesError={messagesError}
            allEmployees={allEmployees}
            onRefreshEmployees={refetchEmployees}
            onRefreshMessages={refreshMessages}
          />
        )}
        
        <CommunicationTabs
          activeTab={activeTab}
          unreadMessages={unreadMessages}
          onTabChange={handleTabChange}
        >
          <AnnouncementManager
            currentUser={currentUser}
            allEmployees={allEmployees || []}
            isAdmin={isAdmin}
          />
          <Card className="p-4">
            <EmployeeCommunications 
              onRefresh={handleManualRefresh}
              retryCount={retryCount}
            />
          </Card>
        </CommunicationTabs>
      </div>
    </DashboardLayout>
  );
};

export default CommunicationPage;
