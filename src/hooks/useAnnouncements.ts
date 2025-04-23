
import { useState, useEffect } from "react";
import { Announcement, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAnnouncements = (currentUser: User | null, allEmployees: User[]) => {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

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

      let mappedAnnouncements: Announcement[] = (annData || []).map((a: any) => {
        const author = allEmployees.find(x => x.id === a.author_id);
        return {
          id: a.id,
          title: a.title,
          content: a.content,
          createdAt: a.created_at ? new Date(a.created_at) : new Date(),
          author: author?.name || "Unknown",
          priority: a.priority,
          readBy: [],
          hasQuiz: !!a.has_quiz,
          attachments: Array.isArray(a.attachments) ? a.attachments : [],
        };
      });

      if (currentUser) {
        const { data: reads, error: readsError } = await supabase
          .from("announcement_recipients")
          .select("announcement_id, read_at")
          .eq("user_id", currentUser.id);

        if (readsError) {
          console.error("Read status fetch error:", readsError);
        } else if (reads) {
          mappedAnnouncements = mappedAnnouncements.map(a => ({
            ...a,
            readBy: reads.filter((rec: any) => rec.announcement_id === a.id && rec.read_at).length > 0
              ? [currentUser.id]
              : []
          }));
        }
      }
      setAnnouncements(mappedAnnouncements);
    } catch (err) {
      console.error("Unexpected error in fetchAnnouncements:", err);
      toast({ title: "Failed to load announcements", description: "An unexpected error occurred", variant: "destructive" });
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from("announcement_recipients")
        .update({ read_at: new Date().toISOString() })
        .eq("announcement_id", id)
        .eq("user_id", currentUser.id);
        
      if (error) {
        console.error("Mark as read error:", error);
        toast({ title: "Failed to mark as read", description: error.message, variant: "destructive" });
        return;
      }
      
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
    } catch (err) {
      console.error("Unexpected error in markAsRead:", err);
      toast({ title: "Failed to mark as read", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  const handleEdit = async (announcement: Announcement) => {
    console.log("Edit announcement:", announcement);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAnnouncements(prevAnnouncements => prevAnnouncements.filter(a => a.id !== id));
      toast({
        title: "Announcement deleted",
        description: "The announcement has been successfully deleted",
      });
    } catch (err: any) {
      console.error('Error deleting announcement:', err);
      toast({
        title: "Error",
        description: "Failed to delete the announcement",
        variant: "destructive"
      });
    }
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
