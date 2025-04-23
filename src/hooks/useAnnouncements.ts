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
          requires_acknowledgment: a.requires_acknowledgment,
          attachments: Array.isArray(a.attachments) ? a.attachments : [],
        };
      });

      // Only fetch read status if we have a current user
      if (currentUser) {
        const { data: reads, error: readsError } = await supabase
          .from("announcement_recipients")
          .select("announcement_id, read_at")
          .eq("user_id", currentUser.id);

        if (readsError) {
          console.error("Read status fetch error:", readsError);
        } else if (reads) {
          // Update the read status based on database records
          mappedAnnouncements = mappedAnnouncements.map(a => ({
            ...a,
            readBy: reads.some((rec: any) => rec.announcement_id === a.id && rec.read_at) 
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
    
    // Find the announcement in our current state
    const announcement = announcements.find(a => a.id === id);
    if (!announcement || announcement.readBy.includes(currentUser.id)) {
      // Already marked as read, no need to update
      return;
    }
    
    try {
      // Check if an entry exists first
      const { data, error: checkError } = await supabase
        .from("announcement_recipients")
        .select("*")
        .eq("announcement_id", id)
        .eq("user_id", currentUser.id)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking announcement recipient:", checkError);
        toast({ title: "Failed to mark as read", description: checkError.message, variant: "destructive" });
        return;
      }
      
      let error;
      
      if (data) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("announcement_recipients")
          .update({ read_at: new Date().toISOString() })
          .eq("announcement_id", id)
          .eq("user_id", currentUser.id);
          
        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from("announcement_recipients")
          .insert({
            announcement_id: id,
            user_id: currentUser.id,
            read_at: new Date().toISOString()
          });
          
        error = insertError;
      }
        
      if (error) {
        console.error("Mark as read error:", error);
        toast({ title: "Failed to mark as read", description: error.message, variant: "destructive" });
        return;
      }
      
      // Update local state
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
      
      console.log(`Announcement ${id} marked as read`);
    } catch (err) {
      console.error("Unexpected error in markAsRead:", err);
      toast({ title: "Failed to mark as read", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  const handleEdit = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({
          title: announcement.title,
          content: announcement.content,
          priority: announcement.priority,
          has_quiz: announcement.hasQuiz,
          target_type: announcement.target_type,
          attachments: announcement.attachments,
          requires_acknowledgment: announcement.requires_acknowledgment
        })
        .eq('id', announcement.id);
      
      if (error) throw error;
      
      // Update local state
      setAnnouncements(prevAnnouncements =>
        prevAnnouncements.map(a => 
          a.id === announcement.id ? announcement : a
        )
      );
      
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
    } catch (err: any) {
      console.error('Error updating announcement:', err);
      toast({
        title: "Error",
        description: "Failed to update the announcement",
        variant: "destructive"
      });
    }
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
