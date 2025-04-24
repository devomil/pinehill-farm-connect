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
import { supabase } from "@/integrations/supabase/client";
import { useAnnouncementAcknowledge } from "@/hooks/announcement/useAnnouncementAcknowledge";

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

  const { acknowledgeAnnouncement } = useAnnouncementAcknowledge(currentUser?.id);

  const handleAcknowledge = async (announcementId: string) => {
    const success = await acknowledgeAnnouncement(announcementId);
    if (success) {
      refreshAnnouncements();
    }
  };

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

  const handleAttachmentAction = async (attachment: { name: string; type: string; url?: string }) => {
    console.log("Opening attachment:", attachment);
    
    try {
      // If we already have a URL, use it directly
      if (attachment.url) {
        window.open(attachment.url, '_blank');
        return;
      }
      
      // Check if storage is available
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('announcements');
        
      if (bucketError) {
        console.error('Error checking storage bucket:', bucketError);
        toast({
          title: "Storage not configured",
          description: "The storage for attachments is not properly configured.",
          variant: "destructive"
        });
        return;
      }
      
      // List available files to debug
      const { data: files, error: listError } = await supabase
        .storage
        .from('announcements')
        .list();
      
      if (listError) {
        console.error('Error listing files:', listError);
      } else {
        console.log("Available files in storage:", files);
      }
      
      // Attempt to get a signed URL for the attachment from storage
      const { data, error } = await supabase
        .storage
        .from('announcements')
        .createSignedUrl(`${attachment.name}`, 3600); // 1 hour expiry
      
      if (error) {
        console.error('Error creating signed URL:', error);
        toast({
          title: "Failed to open attachment",
          description: "Could not retrieve the attachment URL. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      if (data?.signedUrl) {
        console.log("Got signed URL:", data.signedUrl);
        window.open(data.signedUrl, '_blank');
      } else {
        console.error('No signed URL returned');
        toast({
          title: "Failed to open attachment",
          description: "Could not generate a preview URL for this attachment.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error handling attachment:', error);
      toast({
        title: "Failed to open attachment",
        description: "There was a problem opening this attachment. Please try again.",
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

  const handleSaveEdit = (updatedAnnouncement: Announcement) => {
    handleEdit(updatedAnnouncement);
    setEditingAnnouncement(null);
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
          onAttachmentAction={handleAttachmentAction}
          onAcknowledge={handleAcknowledge}
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
