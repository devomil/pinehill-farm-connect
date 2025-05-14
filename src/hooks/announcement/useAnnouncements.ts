
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
  const lastFetchTime = useRef(0);
  const REFRESH_COOLDOWN = 5000; // 5 seconds minimum between refreshes
  
  const { markAsRead } = useAnnouncementReadStatus(currentUser?.id);
  const { handleEdit, handleDelete } = useAnnouncementActions();
  const { refreshDashboardData } = useDashboardDataRefresh();
  
  // Function to mark an announcement as read
  const markAsReadById = useCallback(async (id: string) => {
    if (!currentUser?.id) return;
    
    try {
      await markAsRead(id);
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
      toast({
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive"
      });
      setError(err instanceof Error ? err : new Error("Unknown error"));
    }
  }, [currentUser?.id, markAsRead]);

  // Function to fetch announcements from the database
  const fetchAnnouncements = useCallback(async (force = false) => {
    if (!currentUser?.id || loadingRef.current) return;
    
    // Prevent too frequent refreshes unless forced
    const now = Date.now();
    if (!force && (now - lastFetchTime.current < REFRESH_COOLDOWN)) {
      debug.info("Skipping fetch - too soon since last fetch");
      return;
    }
    
    try {
      debug.info("Fetching announcements");
      loadingRef.current = true;
      setLoading(true);
      lastFetchTime.current = now;
      
      // Fetch announcements from the database
      const { data, error: dbError } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (dbError) throw dbError;
      
      // Map each announcement individually and then create an array
      const mappedAnnouncements: Announcement[] = data.map(announcement => 
        mapAnnouncementData(announcement, currentUser?.id)
      );
      
      setAnnouncements(mappedAnnouncements);
      setHasLoaded(true);
      setError(null);
      debug.info(`Fetched ${mappedAnnouncements.length} announcements`);
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive"
      });
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [currentUser?.id, debug]);
  
  // Effect to fetch announcements initially and when dependencies change
  useEffect(() => {
    if (currentUser?.id && allEmployees.length > 0) {
      // Skip if we've already loaded and it's too soon for a refresh
      if (hasLoaded && (Date.now() - lastFetchTime.current < REFRESH_COOLDOWN)) {
        debug.info("Skipping initial fetch - already loaded recently");
        return;
      }
      
      // Use setTimeout to avoid blocking the UI
      if (!hasLoaded) {
        debug.info("Initial load of announcements");
        const timer = setTimeout(() => {
          fetchAnnouncements(true);
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
      fetchAnnouncements(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);
  
  // Function to handle acknowledgment of announcements
  const acknowledgeAnnouncement = useCallback(async (id: string) => {
    if (!currentUser?.id) return Promise.resolve();
    
    try {
      // This would be implemented in a separate hook, but for now we'll just
      // add a placeholder that updates the UI
      toast({
        description: "Announcement acknowledged",
        variant: "success"
      });
      return Promise.resolve();
    } catch (err) {
      toast({
        description: "Failed to acknowledge announcement",
        variant: "destructive"
      });
      return Promise.reject(err);
    }
  }, [currentUser?.id]);

  return {
    announcements,
    loading,
    error,
    fetchAnnouncements,
    markAsRead: markAsReadById,
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
