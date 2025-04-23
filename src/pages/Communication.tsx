import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CommunicationTabs } from "@/components/communication/CommunicationTabs";
import { Badge } from "@/components/ui/badge";
import { Announcement, User } from "@/types";
import { useAnnouncements } from "@/hooks/announcement/useAnnouncements";
import { useAuth } from "@/contexts/AuthContext";
import { CommunicationHeader } from "@/components/communication/CommunicationHeader";
import { useToast } from "@/hooks/use-toast";
import { EditAnnouncementDialog } from "@/components/communication/announcement/EditAnnouncementDialog";

const Communication = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [allEmployees, setAllEmployees] = useState<User[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

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
    if (currentUser && allEmployees.length > 0) {
      fetchAnnouncements();
    }
  }, [currentUser, allEmployees]);

  const refreshAnnouncements = () => {
    fetchAnnouncements();
  };

  const isRead = (announcement: Announcement) => {
    return announcement.readBy.includes(currentUser?.id || "");
  };

  const handleAttachmentAction = (attachment: { name: string; type: string; url?: string }) => {
    if (attachment.url) {
      try {
        window.open(attachment.url, '_blank');
      } catch (error) {
        console.error('Error opening attachment:', error);
        toast({
          title: "Failed to open attachment",
          description: "There was a problem opening this attachment. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Missing URL",
        description: "This attachment doesn't have a valid URL.",
        variant: "destructive"
      });
    }
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

  const isAdmin = currentUser?.role === "admin" || currentUser?.id === "00000000-0000-0000-0000-000000000001";

  const onEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
  };

  const handleSaveEdit = () => {
    if (editingAnnouncement) {
      handleEdit(editingAnnouncement);
      setEditingAnnouncement(null);
    }
  };

  console.log("Current user:", currentUser);
  console.log("Is admin:", isAdmin);

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
          onEdit={onEditAnnouncement}
          onDelete={handleDelete}
          isAdmin={isAdmin}
        />

        <EditAnnouncementDialog
          announcement={editingAnnouncement}
          allEmployees={allEmployees}
          onClose={() => setEditingAnnouncement(null)}
          onSave={handleSaveEdit}
        />
      </div>
    </DashboardLayout>
  );
};

export default Communication;
