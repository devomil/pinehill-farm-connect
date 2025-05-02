
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployees } from "@/hooks/useEmployees";
import { AnnouncementManager } from "@/components/communication/announcement/AnnouncementManager";
import { AnnouncementHeader } from "@/components/communication/announcement/AnnouncementHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommunications } from "@/hooks/useCommunications";
import { EmployeeCommunications } from "@/components/communications/EmployeeCommunications";
import { Card } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";

const Communication = () => {
  const { currentUser } = useAuth();
  const { unfilteredEmployees: allEmployees, loading: employeesLoading } = useEmployees();
  // Exclude shift coverage messages from direct communications
  const { unreadMessages, refreshMessages } = useCommunications(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get tab from URL params
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get("tab") || "announcements";
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl);
  
  useEffect(() => {
    // Set active tab based on URL parameter
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);
  
  useEffect(() => {
    console.log("Communication page loaded - currentUser:", currentUser);
    
    // Refresh messages when the page loads - only if on messages tab
    if (activeTab === "messages") {
      refreshMessages();
    }
  }, [currentUser, allEmployees, activeTab, refreshMessages]);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AnnouncementHeader 
          isAdmin={isAdmin}
          allEmployees={allEmployees}
          onAnnouncementCreate={handleAnnouncementCreate}
          loading={employeesLoading}
        />
        
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
              allEmployees={allEmployees}
              isAdmin={isAdmin}
            />
          </TabsContent>
          
          <TabsContent value="messages">
            <Card className="p-4">
              <EmployeeCommunications />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Communication;
