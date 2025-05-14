
import { useState, useEffect, useCallback, useRef } from "react";
import { Announcement, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { mapAnnouncementData, updateAnnouncementReadStatus } from "./utils/announcementUtils";
import { useAnnouncementReadStatus } from "./useAnnouncementReadStatus";
import { useAnnouncementActions } from "./useAnnouncementActions";
import { useAnnouncementDelete } from "./useAnnouncementDelete";
import { useAnnouncementEdit } from "./useAnnouncementEdit";
import { useDebug } from "@/hooks/useDebug";

export const useAnnouncements = (currentUser: User | null, allEmployees: User[]) => {
  const debug = useDebug('hooks.announcements', { logStateChanges: true });
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const loadingRef = useRef(false);
  
  const { markAsReadById, markAsReadForUser } = useAnnouncementReadStatus(currentUser?.id);
  const { acknowledgeAnnouncement } = useAnnouncementActions(currentUser?.id);
  const { deleteAnnouncement } = useAnnouncementDelete();
  const { editAnnouncement } = useAnnouncementEdit();
  const { refreshDashboardData } = useDashboardDataRefresh();
  
  // Function to mark an announcement as read
  const markAsRead = useCallback(async (id: string) => {
    if (!currentUser?.id) return;
    
    try {
      await markAsReadById(id);
      // Update the local state with the updated read status
      setAnnouncements(prevAnnouncements =>
        prevAnnouncements.map(announcement =>
          announcement.id === id
            ? {
                ...announcement,
                readBy: [...announcement.readBy, currentUser.id as string]
              }
            : announcement
        )
      );
    } catch (err) {
      // Use toast.error with title first, then description
      toast({
        title: "Failed to mark announcement as read",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive"
      });
      setError(err instanceof Error ? err : new Error("Unknown error"));
    }
  }, [currentUser?.id, markAsReadById]);

  // Function to fetch announcements from the database
  const fetchAnnouncements = useCallback(async () => {
    if (!currentUser?.id || loadingRef.current) return;
    
    try {
      debug.info("Fetching announcements");
      loadingRef.current = true;
      setLoading(true);
      
      // Fetch announcements from the database
      const { data, error: dbError } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (dbError) throw dbError;
      
      // Map the fetched data to add readBy array and current user ID
      const mappedAnnouncements = await Promise.all(
        data.map(async (announcement) => await mapAnnouncementData(
          announcement, 
          currentUser?.id,
          allEmployees
        ))
      );
      
      setAnnouncements(mappedAnnouncements);
      setHasLoaded(true);
      setError(null);
      debug.info(`Fetched ${mappedAnnouncements.length} announcements`);
    } catch (err) {
      // Use toast.error with title first, then description
      toast({
        title: "Failed to load announcements",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive"
      });
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [currentUser?.id, allEmployees, debug]);
  
  // Effect to fetch announcements initially and when dependencies change
  useEffect(() => {
    if (currentUser?.id && allEmployees.length > 0) {
      // Use setTimeout to avoid blocking the UI
      if (!hasLoaded) {
        debug.info("Initial load of announcements");
        const timer = setTimeout(() => {
          fetchAnnouncements();
        }, 300);
        
        return () => clearTimeout(timer);
      } else {
        // Re-fetch when dependencies change but we've already done initial load
        debug.info("Dependencies changed, refreshing announcements");
        const timer = setTimeout(() => {
          fetchAnnouncements();
        }, 300);
        
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser, allEmployees, fetchAnnouncements, hasLoaded, debug]);

  // Add effect to fetch announcements when component mounts
  useEffect(() => {
    // Only fetch on first mount or when currentUser changes
    if (currentUser?.id && !hasLoaded) {
      fetchAnnouncements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);
  
  // Function to handle editing an announcement
  const handleEdit = useCallback(async (updatedAnnouncement: Announcement) => {
    if (!currentUser) return false;
    
    try {
      await editAnnouncement(updatedAnnouncement);
      await fetchAnnouncements();
      
      // Also refresh dashboard data if needed
      if (refreshDashboardData) {
        refreshDashboardData();
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      return false;
    }
  }, [currentUser, editAnnouncement, fetchAnnouncements, refreshDashboardData]);
  
  // Function to handle deleting an announcement
  const handleDelete = useCallback(async (id: string) => {
    if (!currentUser) return false;
    
    try {
      await deleteAnnouncement(id);
      await fetchAnnouncements();
      
      // Also refresh dashboard data if needed
      if (refreshDashboardData) {
        refreshDashboardData();
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      return false;
    }
  }, [currentUser, deleteAnnouncement, fetchAnnouncements, refreshDashboardData]);

  return {
    announcements,
    loading,
    error,
    fetchAnnouncements,
    markAsRead,
    handleEdit,
    handleDelete,
    acknowledgeAnnouncement
  };
};

// Helper hook for dashboard data refreshing to avoid circular imports
function useDashboardDataRefresh() {
  // This function would ideally be from a context or another hook
  const refreshDashboardData = () => {
    // Implement if needed or return undefined
    return undefined;
  };
  
  return { refreshDashboardData };
}
