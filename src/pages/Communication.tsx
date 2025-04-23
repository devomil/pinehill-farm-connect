
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CommunicationTabs } from "@/components/communication/CommunicationTabs";
import { Badge } from "@/components/ui/badge";
import { Announcement } from "@/types";
import { useAnnouncements } from "@/hooks/announcement/useAnnouncements";
import { useAuth } from "@/contexts/AuthContext";
import { CommunicationHeader } from "@/components/communication/CommunicationHeader";
import { useToast } from "@/hooks/use-toast";
import { EditAnnouncementDialog } from "@/components/communication/announcement/EditAnnouncementDialog";
import { useEmployees } from "@/hooks/useEmployees";

const Communication = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { unfilteredEmployees: allEmployees, loading: employeesLoading } = useEmployees();
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const {
    announcements,
    loading,
    fetchAnnouncements,
    markAsRead,
    handleEdit,
    handleDelete
  } = useAnnouncements(currentUser, allEmployees);

  // Debug log to see if announcements are loading
  useEffect(() => {
    console.log("Communication page - currentUser:", currentUser);
    console.log("Communication page - employees:", allEmployees);
    console.log("Communication page - announcements:", announcements);
    console.log("Communication page - loading:", loading);
  }, [currentUser, allEmployees, announcements, loading]);

  const refreshAnnouncements = () => {
    console.log("Refreshing announcements...");
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <CommunicationHeader 
          isAdmin={isAdmin}
          allEmployees={allEmployees}
          onAnnouncementCreate={refreshAnnouncements}
          loading={employeesLoading}
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
          loading={employeesLoading}
        />
      </div>
    </DashboardLayout>
  );
};

export default Communication;
