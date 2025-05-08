
import { useState, useEffect, useCallback } from "react";
import { Announcement, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mapAnnouncementData, updateAnnouncementReadStatus } from "./utils/announcementUtils";
import { useAnnouncementReadStatus } from "./useAnnouncementReadStatus";
import { useAnnouncementActions } from "./useAnnouncementActions";
import { useDashboardData } from "@/hooks/useDashboardData";

export const useAnnouncements = (currentUser: User | null, allEmployees: User[]) => {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { markAsRead: markAsReadInDb } = useAnnouncementReadStatus(currentUser?.id);
  const { handleEdit: editAnnouncement, handleDelete: deleteAnnouncement } = useAnnouncementActions();
  const { refetchData: refreshDashboardData } = useDashboardData();

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const { data: annData, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Announcement fetch error:", error);
        toast({ title: "Failed to load announcements", description: error.message, variant: "destructive" });
        setAnnouncements([]);
        setLoading(false);
        return;
      }

      console.log("Fetched announcements:", annData);
      let mappedAnnouncements = mapAnnouncementData(annData, allEmployees);

      if (currentUser) {
        const { data: reads, error: readsError } = await supabase
          .from("announcement_recipients")
          .select("announcement_id, read_at, acknowledged_at")
          .eq("user_id", currentUser.id);

        if (readsError) {
          console.error("Read status fetch error:", readsError);
        } else if (reads) {
          mappedAnnouncements = updateAnnouncementReadStatus(mappedAnnouncements, reads, currentUser.id);
        }
      }
      
      console.log("Mapped announcements:", mappedAnnouncements);
      setAnnouncements(mappedAnnouncements);
      
      // Refresh dashboard data to update unread counts
      refreshDashboardData();
    } catch (err) {
      console.error("Unexpected error in fetchAnnouncements:", err);
      toast({ title: "Failed to load announcements", description: "An unexpected error occurred", variant: "destructive" });
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, allEmployees, toast, refreshDashboardData]);

  // Add effect to fetch announcements when component mounts
  useEffect(() => {
    fetchAnnouncements();
  }, [currentUser?.id, fetchAnnouncements]); // Re-fetch when user changes

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
      console.error("Error marking announcement as read:", error);
      return Promise.reject(error);
    }
  };

  const handleEdit = async (announcement: Announcement): Promise<boolean> => {
    // Forward the Promise<boolean> result
    const result = await editAnnouncement(announcement);
    if (result) {
      await fetchAnnouncements();
      refreshDashboardData();
    }
    return result;
  };

  const handleDelete = async (id: string): Promise<boolean> => {
    // Forward the Promise<boolean> result
    const result = await deleteAnnouncement(id);
    if (result) {
      await fetchAnnouncements();
      refreshDashboardData();
    }
    return result;
  };

  return {
    announcements,
    loading,
    fetchAnnouncements,
    markAsRead,
    handleEdit,
    handleDelete
  };
};
