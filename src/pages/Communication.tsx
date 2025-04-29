
import React, { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployees } from "@/hooks/useEmployees";
import { AnnouncementManager } from "@/components/communication/announcement/AnnouncementManager";
import { AnnouncementHeader } from "@/components/communication/announcement/AnnouncementHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Communication = () => {
  const { currentUser } = useAuth();
  const { unfilteredEmployees: allEmployees, loading: employeesLoading } = useEmployees();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("Communication page (announcements) loaded - currentUser:", currentUser);
    console.log("Communication page - employees:", allEmployees);
  }, [currentUser, allEmployees]);

  const isAdmin = currentUser?.role === "admin" || currentUser?.id === "00000000-0000-0000-0000-000000000001";

  const handleAnnouncementCreate = () => {
    console.log("Announcement created, refreshing...");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200">
          <MessageSquare className="h-4 w-4 text-blue-500" />
          <AlertDescription className="flex justify-between items-center">
            <span>Looking for direct messages? Go to the Direct Messages page.</span>
            <Button 
              variant="outline" 
              size="sm"
              className="border-blue-500 text-blue-700 hover:bg-blue-100"
              onClick={() => navigate('/communications')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Direct Messages
            </Button>
          </AlertDescription>
        </Alert>
        
        <AnnouncementHeader 
          isAdmin={isAdmin}
          allEmployees={allEmployees}
          onAnnouncementCreate={handleAnnouncementCreate}
          loading={employeesLoading}
        />
        
        <AnnouncementManager
          currentUser={currentUser}
          allEmployees={allEmployees}
          isAdmin={isAdmin}
        />
      </div>
    </DashboardLayout>
  );
};

export default Communication;
