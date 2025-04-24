
import React, { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployees } from "@/hooks/useEmployees";
import { AnnouncementManager } from "@/components/communication/announcement/AnnouncementManager";
import { AnnouncementHeader } from "@/components/communication/announcement/AnnouncementHeader";

const Communication = () => {
  const { currentUser } = useAuth();
  const { unfilteredEmployees: allEmployees, loading: employeesLoading } = useEmployees();
  
  useEffect(() => {
    console.log("Communication page - currentUser:", currentUser);
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
