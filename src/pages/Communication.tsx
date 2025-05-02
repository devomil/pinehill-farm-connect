
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { AnnouncementManager } from "@/components/communication/announcement/AnnouncementManager";
import { AnnouncementHeader } from "@/components/communication/announcement/AnnouncementHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommunications } from "@/hooks/useCommunications";
import { EmployeeCommunications } from "@/components/communications/EmployeeCommunications";
import { Card } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Bug } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Communication = () => {
  const { currentUser } = useAuth();
  const { unfilteredEmployees: allEmployees, loading: employeesLoading, refetch: refetchEmployees, error: employeeError } = useEmployeeDirectory();
  // Exclude shift coverage messages from direct communications
  const { unreadMessages, refreshMessages, error: messagesError } = useCommunications(true);
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
    
    // Refresh messages when the page loads - only if on messages tab
    if (activeTab === "messages") {
      refreshMessages();
    }
  }, [currentUser, allEmployees, activeTab, refreshMessages, refetchEmployees, employeeError, messagesError, employeesLoading]);

  const isAdmin = currentUser?.role === "admin" || currentUser?.id === "00000000-0000-0000-0000-000000000001";

  const handleAnnouncementCreate = () => {
    console.log("Announcement created, refreshing...");
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
    
    // Only refresh messages when switching to messages tab
    if (value === "messages") {
      refreshMessages();
    }
  };
  
  // Format error messages safely
  const formatErrorMessage = (err: any): React.ReactNode => {
    if (typeof err === 'string') return err;
    if (err?.message) return err.message;
    return "Unknown error";
  };
  
  // Handle manual refresh of all data
  const handleManualRefresh = () => {
    toast.info("Refreshing all communication data");
    refetchEmployees();
    refreshMessages();
    setRetryCount(prev => prev + 1);
  };
  
  // Are there any errors to display?
  const hasErrors = employeeError || messagesError;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {hasErrors && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading data: {formatErrorMessage(employeeError || messagesError)}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualRefresh} 
                className="ml-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-between items-center">
          <AnnouncementHeader 
            isAdmin={isAdmin}
            allEmployees={allEmployees || []}
            onAnnouncementCreate={handleAnnouncementCreate}
            loading={employeesLoading}
          />
          
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="mr-2"
            >
              <Bug className="h-4 w-4 mr-1" />
              {showDebugInfo ? "Hide Debug" : "Show Debug"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>
        
        {showDebugInfo && (
          <Accordion type="single" collapsible className="mb-4">
            <AccordionItem value="debug-info">
              <AccordionTrigger className="text-sm">Communication Debug Information</AccordionTrigger>
              <AccordionContent className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
                <p><strong>Active tab:</strong> {activeTab}</p>
                <p><strong>Employees loading:</strong> {employeesLoading ? 'true' : 'false'}</p>
                <p><strong>Employee count:</strong> {allEmployees?.length || 0}</p>
                <p><strong>Unread messages:</strong> {unreadMessages?.length || 0}</p>
                <p><strong>Retry count:</strong> {retryCount}</p>
                <p><strong>Current user:</strong> {currentUser?.email} (ID: {currentUser?.id})</p>
                <p><strong>Is admin:</strong> {isAdmin ? 'true' : 'false'}</p>
                
                {employeeError && (
                  <>
                    <p className="mt-2 font-semibold text-red-500">Employee Error:</p>
                    <pre className="whitespace-pre-wrap text-red-500">
                      {typeof employeeError === 'object' ? JSON.stringify(employeeError, null, 2) : String(employeeError)}
                    </pre>
                  </>
                )}
                
                {messagesError && (
                  <>
                    <p className="mt-2 font-semibold text-red-500">Messages Error:</p>
                    <pre className="whitespace-pre-wrap text-red-500">
                      {typeof messagesError === 'object' ? JSON.stringify(messagesError, null, 2) : String(messagesError)}
                    </pre>
                  </>
                )}
                
                {allEmployees && allEmployees.length > 0 && (
                  <>
                    <p className="mt-2 font-semibold">Employee sample:</p>
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(allEmployees.slice(0, 2), null, 2)}
                    </pre>
                  </>
                )}
                
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={refetchEmployees} className="mr-2">
                    Refresh Employees
                  </Button>
                  <Button size="sm" variant="outline" onClick={refreshMessages}>
                    Refresh Messages
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="announcements">Company Announcements</TabsTrigger>
            <TabsTrigger value="messages">
              Direct Messages
              {unreadMessages && unreadMessages.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {unreadMessages.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="announcements">
            <AnnouncementManager
              currentUser={currentUser}
              allEmployees={allEmployees || []}
              isAdmin={isAdmin}
            />
          </TabsContent>
          
          <TabsContent value="messages">
            <Card className="p-4">
              <EmployeeCommunications 
                onRefresh={handleManualRefresh}
                retryCount={retryCount}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Communication;
