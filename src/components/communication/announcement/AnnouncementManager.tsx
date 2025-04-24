
import React, { useState } from "react";
import { Announcement, User } from "@/types";
import { useAnnouncements } from "@/hooks/announcement/useAnnouncements";
import { CommunicationTabs } from "@/components/communication/CommunicationTabs";
import { EditAnnouncementDialog } from "@/components/communication/announcement/EditAnnouncementDialog";
import { Badge } from "@/components/ui/badge";

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
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const {
    announcements,
    loading,
    fetchAnnouncements,
    markAsRead,
    handleEdit,
    handleDelete
  } = useAnnouncements(currentUser, allEmployees);

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

  // Add a new function to handle acknowledgment by ID
  const handleAcknowledge = async (announcementId: string) => {
    // Find the announcement by ID
    const announcement = announcements.find(a => a.id === announcementId);
    if (announcement) {
      // Update the announcement to mark it as acknowledged
      const updatedAnnouncement = {
        ...announcement,
        acknowledgements: [...(announcement.acknowledgements || []), currentUser?.id || '']
      };
      // Save the updated announcement
      await handleSaveEdit(updatedAnnouncement);
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
