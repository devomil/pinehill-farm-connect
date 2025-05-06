import React, { useState } from "react";
import { Announcement, User } from "@/types";
import { useAnnouncements } from "@/hooks/announcement/useAnnouncements";
import { CommunicationTabs } from "@/components/communication/CommunicationTabs";
import { EditAnnouncementDialog } from "@/components/communication/announcement/EditAnnouncementDialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAnnouncementAcknowledge } from "@/hooks/announcement/useAnnouncementAcknowledge";

interface AnnouncementManagerProps {
  currentUser: User | null;
  allEmployees: User[];
  isAdmin: boolean;
}

export const AnnouncementManager: React.FC<AnnouncementManagerProps> = ({
  currentUser,
  allEmployees,
  isAdmin,
}) => {
  const { toast } = useToast();
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const {
    announcements,
    loading,
    fetchAnnouncements,
    markAsRead,
    handleEdit,
    handleDelete
  } = useAnnouncements(currentUser, allEmployees);

  const { acknowledgeAnnouncement, isAcknowledging } = useAnnouncementAcknowledge(currentUser?.id);

  const handleSaveEdit = async (updatedAnnouncement: Announcement) => {
    console.log("Saving edited announcement:", updatedAnnouncement);
    const success = await handleEdit(updatedAnnouncement);
    if (success) {
      setEditingAnnouncement(null);
      fetchAnnouncements();
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    console.log("Deleting announcement:", id);
    const success = await handleDelete(id);
    if (success) {
      fetchAnnouncements();
    }
  };

  // Handle acknowledgment by ID
  const handleAcknowledge = async (announcementId: string) => {
    console.log("Acknowledging announcement:", announcementId);
    if (!currentUser?.id) {
      console.error("No current user ID available");
      return;
    }

    try {
      // Call the acknowledgeAnnouncement function from the hook
      const success = await acknowledgeAnnouncement(announcementId);
      
      if (success) {
        // Refresh announcements to update UI
        await fetchAnnouncements();
        toast({
          title: "Announcement acknowledged",
          description: "Thank you for acknowledging this announcement"
        });
      } else {
        throw new Error("Failed to acknowledge announcement");
      }
    } catch (error) {
      console.error("Error in handleAcknowledge:", error);
      toast({
        title: "Failed to acknowledge",
        description: "There was an issue acknowledging this announcement",
        variant: "destructive"
      });
      throw error; // Re-throw to allow the component to handle visual feedback
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

  const isRead = (announcement: Announcement) => {
    return announcement.readBy.includes(currentUser?.id || "");
  };

  const handleAttachmentAction = async (attachment: { name: string; type: string; url?: string; size?: number }) => {
    try {
      console.log("Handling attachment action:", attachment);
      
      // If URL is provided, use it directly
      if (attachment.url) {
        window.open(attachment.url, '_blank');
        return;
      }
      
      // Get a signed URL from Supabase storage
      const { data, error } = await supabase
        .storage
        .from('announcements')
        .createSignedUrl(`${attachment.name}`, 3600); // 1 hour expiry
      
      if (error) {
        console.error('Error creating signed URL:', error);
        toast({
          title: "Could not open attachment",
          description: "There was an issue accessing the attachment",
          variant: "destructive"
        });
        return;
      }

      if (data?.signedUrl) {
        console.log("Opening signed URL:", data.signedUrl);
        window.open(data.signedUrl, '_blank');
      } else {
        toast({
          title: "Error",
          description: "Could not generate a URL for this attachment",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error handling attachment:', error);
      toast({
        title: "Could not open attachment",
        description: "There was an issue accessing the attachment",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <CommunicationTabs
        announcements={announcements}
        loading={loading}
        isRead={isRead}
        markAsRead={markAsRead}
        getPriorityBadge={getPriorityBadge}
        currentUserId={currentUser?.id}
        onEdit={isAdmin ? (announcement) => setEditingAnnouncement(announcement) : undefined}
        onDelete={isAdmin ? handleDeleteAnnouncement : undefined}
        isAdmin={isAdmin}
        onAcknowledge={handleAcknowledge}
        onAttachmentAction={handleAttachmentAction}
      />

      {editingAnnouncement && (
        <EditAnnouncementDialog
          announcement={editingAnnouncement}
          allEmployees={allEmployees}
          onClose={() => setEditingAnnouncement(null)}
          onSave={handleSaveEdit}
          loading={loading}
        />
      )}
    </>
  );
};
