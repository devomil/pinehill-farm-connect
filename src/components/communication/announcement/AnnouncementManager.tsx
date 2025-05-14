import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Announcement, User } from "@/types";
import { useAnnouncements } from "@/hooks/announcement/useAnnouncements";
import { useAnnouncementAcknowledge } from "@/hooks/announcement/useAnnouncementAcknowledge";
import { useAnnouncementReadStatus } from "@/hooks/announcement/useAnnouncementReadStatus";
import { AnnouncementErrorHandler } from "./AnnouncementErrorHandler";
import { AnnouncementActionsManager } from "./AnnouncementActions";
import { AnnouncementContent } from "./AnnouncementContent";
import { useAnnouncementAttachmentHandler } from "./AnnouncementAttachmentHandler";
import { toast } from "@/hooks/use-toast";
import { useDebug } from "@/hooks/useDebug";
import ErrorBoundary from "@/components/debug/ErrorBoundary";

interface AnnouncementManagerProps {
  currentUser: User | null;
  allEmployees: User[];
  isAdmin: boolean;
}

export const AnnouncementManager: React.FC<AnnouncementManagerProps> = React.memo(({
  currentUser,
  allEmployees,
  isAdmin,
}) => {
  // Set up debug logging
  const debug = useDebug('communication.announcement.manager', {
    trackRenders: true,
    logStateChanges: true
  });
  
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const mountedRef = useRef(true);
  
  const {
    announcements,
    loading,
    error,
    fetchAnnouncements,
    markAsRead: markAnnouncementReadInList,
    handleEdit,
    handleDelete
  } = useAnnouncements(currentUser, allEmployees);

  const { acknowledgeAnnouncement } = useAnnouncementAcknowledge(currentUser?.id);
  const { markAsRead } = useAnnouncementReadStatus(currentUser?.id);
  const { handleAttachmentAction } = useAnnouncementAttachmentHandler();
  
  // Debug log current state using our new debugging system
  useEffect(() => {
    debug.info("AnnouncementManager state", {
      announcementsCount: announcements.length,
      loading,
      isAdmin,
      hasError: !!error,
      editingId: editingAnnouncement?.id
    });
  }, [announcements.length, loading, isAdmin, error, editingAnnouncement, debug]);
  
  // Cleanup mounted ref when component unmounts
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  // Memoize the announcement read check function to prevent unnecessary recalculations
  const isAnnouncementRead = useCallback((announcement: Announcement) => {
    return announcement.readBy.includes(currentUser?.id || "");
  }, [currentUser?.id]);
  
  // Handle saving edited announcements
  const handleSaveEdit = useCallback(async (updatedAnnouncement: Announcement): Promise<void> => {
    debug.info("Saving edited announcement", { id: updatedAnnouncement.id });
    try {
      const success = await handleEdit(updatedAnnouncement);
      if (success && mountedRef.current) {
        setEditingAnnouncement(null);
        await fetchAnnouncements();
        toast({
          description: "Announcement updated successfully",
          variant: "success"
        });
        debug.info("Announcement updated successfully");
      }
    } catch (error) {
      debug.error("Error saving edited announcement", error);
      toast({
        description: "Failed to update announcement",
        variant: "destructive"
      });
    }
  }, [handleEdit, fetchAnnouncements, debug]);

  // Handle deleting announcements
  const handleDeleteAnnouncement = useCallback(async (id: string): Promise<void> => {
    debug.info("Deleting announcement", { id });
    try {
      const success = await handleDelete(id);
      if (success && mountedRef.current) {
        await fetchAnnouncements();
        toast({
          description: "Announcement deleted successfully",
          variant: "success"
        });
        debug.info("Announcement deleted successfully", { id });
      }
    } catch (error) {
      debug.error("Error deleting announcement", error);
      toast({
        description: "Failed to delete announcement",
        variant: "destructive"
      });
    }
  }, [handleDelete, fetchAnnouncements, debug]);

  // Handle acknowledgment by ID
  const handleAcknowledge = useCallback(async (announcementId: string): Promise<void> => {
    debug.info("Handling announcement acknowledgment", { announcementId });
    if (!currentUser?.id) {
      debug.error("No current user ID available");
      toast({
        description: "Unable to acknowledge: No user ID available",
        variant: "destructive"
      });
      return Promise.reject("No current user ID available");
    }

    try {
      await acknowledgeAnnouncement(announcementId);
      if (mountedRef.current) {
        await fetchAnnouncements();
        toast({
          description: "Announcement acknowledged successfully",
          variant: "success"
        });
        debug.info("Announcement acknowledged successfully", { announcementId });
      }
      return Promise.resolve();
    } catch (error) {
      debug.error("Error in handleAcknowledge", error);
      toast({
        description: "Failed to acknowledge announcement",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  }, [currentUser?.id, acknowledgeAnnouncement, fetchAnnouncements, debug]);

  // Handle mark as read for announcements with proper error handling
  const handleMarkAsRead = useCallback(async (id: string): Promise<void> => {
    debug.info("Mark as read clicked for", { id });
    if (!currentUser?.id) {
      debug.error("Cannot mark as read: No current user ID");
      toast({
        description: "Unable to mark as read: No user ID available",
        variant: "destructive"
      });
      return Promise.reject("No current user ID available");
    }
    
    try {
      await markAsRead(id);
      if (mountedRef.current) {
        await fetchAnnouncements();
        debug.info("Announcement marked as read successfully", { id });
      }
      return Promise.resolve();
    } catch (error) {
      debug.error("Error marking announcement as read", error);
      toast({
        description: "Failed to mark announcement as read",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  }, [currentUser?.id, markAsRead, fetchAnnouncements, debug]);

  // If there's an error, render the error component
  if (error) {
    debug.error("Rendering error handler due to", error);
    return <AnnouncementErrorHandler error={error} onRefresh={fetchAnnouncements} />;
  }

  // Memoized content for better performance
  const content = useMemo(() => (
    <ErrorBoundary componentName="communication.announcement.content">
      <AnnouncementContent
        announcements={announcements}
        loading={loading}
        currentUser={currentUser}
        isAdmin={isAdmin}
        isRead={isAnnouncementRead}
        markAsRead={handleMarkAsRead}
        onEdit={setEditingAnnouncement}
        onDelete={handleDeleteAnnouncement}
        onAcknowledge={handleAcknowledge}
        onAttachmentAction={handleAttachmentAction}
      />
    </ErrorBoundary>
  ), [
    announcements,
    loading,
    currentUser,
    isAdmin,
    isAnnouncementRead,
    handleMarkAsRead,
    handleDeleteAnnouncement,
    handleAcknowledge,
    handleAttachmentAction
  ]);

  const actionsManager = useMemo(() => (
    <ErrorBoundary componentName="communication.announcement.actions">
      <AnnouncementActionsManager
        editingAnnouncement={editingAnnouncement}
        setEditingAnnouncement={setEditingAnnouncement}
        handleSaveEdit={handleSaveEdit}
        loading={loading}
        allEmployees={allEmployees}
      />
    </ErrorBoundary>
  ), [editingAnnouncement, handleSaveEdit, loading, allEmployees]);

  return (
    <>
      {content}
      {actionsManager}
    </>
  );
});

AnnouncementManager.displayName = "AnnouncementManager";
