
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CommunicationTabs } from "@/components/communication/CommunicationTabs";
import { Badge } from "@/components/ui/badge";
import { Announcement, User } from "@/types";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useAuth } from "@/contexts/AuthContext";
import { CommunicationHeader } from "@/components/communication/CommunicationHeader";

const Communication = () => {
  const { currentUser } = useAuth();
  const [allEmployees, setAllEmployees] = useState<User[]>([]);

  // Mocked employees for demo purposes
  useEffect(() => {
    setAllEmployees([
      {
        id: "00000000-0000-0000-0000-000000000001",
        name: "Admin User",
        email: "admin@company.com",
        role: "admin",
        department: "Management",
      },
      {
        id: "00000000-0000-0000-0000-000000000002",
        name: "John Doe",
        email: "john@company.com",
        role: "employee",
        department: "Engineering",
      },
    ]);
  }, []);

  const {
    announcements,
    loading,
    fetchAnnouncements,
    markAsRead,
    handleEdit,
    handleDelete
  } = useAnnouncements(currentUser, allEmployees);

  useEffect(() => {
    if (allEmployees.length > 0) {
      fetchAnnouncements();
    }
  }, [allEmployees]);

  const refreshAnnouncements = () => {
    fetchAnnouncements();
  };

  const isRead = (announcement: Announcement) => {
    return announcement.readBy.includes(currentUser?.id || "");
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "important":
        return <Badge variant="default">Important</Badge>;
      default:
        return <Badge variant="outline">FYI</Badge>;
    }
  };

  const isAdmin = currentUser?.id === "00000000-0000-0000-0000-000000000001";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <CommunicationHeader 
          isAdmin={isAdmin}
          allEmployees={allEmployees}
          onAnnouncementCreate={refreshAnnouncements}
        />
        
        <CommunicationTabs
          announcements={announcements}
          loading={loading}
          isRead={isRead}
          markAsRead={markAsRead}
          getPriorityBadge={getPriorityBadge}
          currentUserId={currentUser?.id}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
};

export default Communication;
