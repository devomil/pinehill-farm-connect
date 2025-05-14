
import { useState, useEffect, useCallback, useRef } from "react";
import { Announcement, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { mapAnnouncementData, updateAnnouncementReadStatus } from "./utils/announcementUtils";
import { useAnnouncementReadStatus } from "./useAnnouncementReadStatus";
import { useAnnouncementActions } from "./useAnnouncementActions";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDebug } from "@/hooks/useDebug";

export const useAnnouncements = (currentUser: User | null, allEmployees: User[]) => {
  const debug = useDebug('hooks.announcements', { logStateChanges: true });
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const isMounted = useRef(true);
  const isFirstLoad = useRef(true);
  const lastFetchTime = useRef(Date.now());
  const isFetchingRef = useRef(false);
  
  const { markAsRead: markAsReadInDb } = useAnnouncementReadStatus(currentUser?.id);
  const { handleEdit: editAnnouncement, handleDelete: deleteAnnouncement } = useAnnouncementActions();
  const { refetchData: refreshDashboardData } = useDashboardData();

  const fetchAnnouncements = useCallback(async (force = false) => {
    // Prevent concurrent fetches and throttle requests (5 second minimum between fetches)
    const now = Date.now();
    if (isFetchingRef.current) {
      debug.info("Skipping fetch - already in progress");
      return;
    }
    
    if (!force && now - lastFetchTime.current < 5000) {
      debug.info(`Skipping fetch - too soon (${Math.round((now - lastFetchTime.current) / 1000)}s since last fetch)`);
      return;
    }
    
    isFetchingRef.current = true;
    !isFirstLoad.current && setLoading(true);
    setError(null);
    
    try {
      debug.info("Fetching announcements...");
      const { data: annData, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        debug.error("Announcement fetch error:", error);
        toast.error("Failed to load announcements", "Error connecting to database");
        setError(error);
        setAnnouncements([]);
        return;
      }

      debug.info("Fetched announcements:", annData);
      let mappedAnnouncements = mapAnnouncementData(annData, allEmployees);

      if (currentUser) {
        const { data: reads, error: readsError } = await supabase
          .from("announcement_recipients")
          .select("announcement_id, read_at, acknowledged_at")
          .eq("user_id", currentUser.id);

        if (readsError) {
          debug.error("Read status fetch error:", readsError);
        } else if (reads) {
          debug.info(`Updating read status with records: ${JSON.stringify(reads)} for user: ${currentUser.id}`);
          mappedAnnouncements = updateAnnouncementReadStatus(mappedAnnouncements, reads, currentUser.id);
        }
      }
      
      debug.info("Mapped announcements:", mappedAnnouncements);
      if (isMounted.current) {
        setAnnouncements(mappedAnnouncements);
        lastFetchTime.current = Date.now();
        isFirstLoad.current = false;
        
        // Refresh dashboard data to update unread counts but only if necessary
        if (annData.length > 0) {
          refreshDashboardData();
        }
      }
    } catch (err) {
      debug.error("Unexpected error in fetchAnnouncements:", err);
      toast.error("Failed to load announcements", "An unexpected error occurred");
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setAnnouncements([]);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        // Delay resetting the fetching flag to prevent rapid consecutive requests
        setTimeout(() => {
          isFetchingRef.current = false;
        }, 300);
      }
    }
  }, [currentUser, allEmployees, refreshDashboardData, debug]);

  // Add effect to fetch announcements when component mounts
  useEffect(() => {
    debug.info("useAnnouncements hook mounted");
    isMounted.current = true;
    
    // Initial fetch
    fetchAnnouncements(true);
    
    // Set up a polling interval to periodically refresh announcements
    // but with much less frequency (every 2 minutes)
    const interval = setInterval(() => {
      debug.info("Auto-refreshing announcements data...");
      fetchAnnouncements();
    }, 120000); // Refresh every 2 minutes
    
    return () => {
      debug.info("useAnnouncements hook unmounted");
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [currentUser?.id, fetchAnnouncements, debug]); // Re-fetch when user changes

  const markAsRead = async (id: string): Promise<void> => {
    if (!currentUser) return Promise.reject("No current user");
    
    try {
      await markAsReadInDb(id);
      
      // Update local state optimistically
      setAnnouncements(prevAnnouncements =>
        prevAnnouncements.map(announcement => {
          if (announcement.id === id && !announcement.readBy.includes(currentUser.id)) {
            return {
              ...announcement,
              readBy: [...announcement.readBy, currentUser.id]
            };
          }
          return announcement;
        })
      );
      
      // Refresh dashboard data to update unread counts
      refreshDashboardData();
      
      return Promise.resolve();
    } catch (error) {
      debug.error("Error marking announcement as read:", error);
      return Promise.reject(error);
    }
  };

  const handleEdit = async (announcement: Announcement): Promise<boolean> => {
    // Forward the Promise<boolean> result
    const result = await editAnnouncement(announcement);
    if (result) {
      await fetchAnnouncements(true);
      refreshDashboardData();
    }
    return result;
  };

  const handleDelete = async (id: string): Promise<boolean> => {
    // Forward the Promise<boolean> result
    const result = await deleteAnnouncement(id);
    if (result) {
      await fetchAnnouncements(true);
      refreshDashboardData();
    }
    return result;
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchAnnouncements(true);
    return retryCount + 1;
  };

  return {
    announcements,
    loading,
    error,
    fetchAnnouncements: () => fetchAnnouncements(true), // Force fetch when manually called
    markAsRead,
    handleEdit,
    handleDelete,
    retryCount,
    handleRetry
  };
};
