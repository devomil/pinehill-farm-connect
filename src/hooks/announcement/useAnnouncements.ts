
import { useState, useEffect } from "react";
import { Announcement, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mapAnnouncementData, updateAnnouncementReadStatus } from "./utils/announcementUtils";
import { useAnnouncementReadStatus } from "./useAnnouncementReadStatus";
import { useAnnouncementActions } from "./useAnnouncementActions";

export const useAnnouncements = (currentUser: User | null, allEmployees: User[]) => {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { markAsRead: markAsReadInDb } = useAnnouncementReadStatus(currentUser?.id);
  const { handleEdit: editAnnouncement, handleDelete: deleteAnnouncement } = useAnnouncementActions();

  const fetchAnnouncements = async () => {
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
    } catch (err) {
      console.error("Unexpected error in fetchAnnouncements:", err);
      toast({ title: "Failed to load announcements", description: "An unexpected error occurred", variant: "destructive" });
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  // Add effect to fetch announcements when component mounts
  useEffect(() => {
    fetchAnnouncements();
  }, [currentUser?.id]); // Re-fetch when user changes

  const markAsRead = async (id: string) => {
    if (!currentUser) return;
    
    const success = await markAsReadInDb(id);
    if (success) {
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
    }
  };

  const handleEdit = async (announcement: Announcement): Promise<boolean> => {
    // Forward the Promise<boolean> result
    return await editAnnouncement(announcement);
  };

  const handleDelete = async (id: string): Promise<boolean> => {
    // Forward the Promise<boolean> result
    return await deleteAnnouncement(id);
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
