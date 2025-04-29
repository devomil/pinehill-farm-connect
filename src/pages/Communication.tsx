
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployees } from "@/hooks/useEmployees";
import { AnnouncementManager } from "@/components/communication/announcement/AnnouncementManager";
import { AnnouncementHeader } from "@/components/communication/announcement/AnnouncementHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommunications } from "@/hooks/useCommunications";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { EmployeeCommunications } from "@/components/communications/EmployeeCommunications";
import { Card } from "@/components/ui/card";

const Communication = () => {
  const { currentUser } = useAuth();
  const { unfilteredEmployees: allEmployees, loading: employeesLoading } = useEmployees();
  const { unreadMessages } = useCommunications();
  const [activeTab, setActiveTab] = useState<string>("announcements");
  
  useEffect(() => {
    console.log("Communication page loaded - currentUser:", currentUser);
    console.log("Communication page - employees:", allEmployees);
  }, [currentUser, allEmployees]);

  const isAdmin = currentUser?.role === "admin" || currentUser?.id === "00000000-0000-0000-0000-000000000001";

  const handleAnnouncementCreate = () => {
    console.log("Announcement created, refreshing...");
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
