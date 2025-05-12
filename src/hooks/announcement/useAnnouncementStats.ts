
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnnouncementData } from "@/types/announcements";

export const useAnnouncementStats = () => {
  const fetchAnnouncementStats = async (): Promise<AnnouncementData[]> => {
    // First, get all announcements
    const { data: announcements, error: announcementsError } = await supabase
      .from("announcements")
      .select(`
        id,
        title,
        created_at,
        priority,
        requires_acknowledgment
      `)
      .order("created_at", { ascending: false });

    if (announcementsError) {
      console.error("Error fetching announcements:", announcementsError);
      throw announcementsError;
    }

    // Create a map to store stats for each announcement
    const statsMap: Record<string, AnnouncementData> = {};

    // Initialize the map with announcements
    for (const announcement of announcements) {
      statsMap[announcement.id] = {
        id: announcement.id,
        title: announcement.title,
        created_at: announcement.created_at,
        total_users: 0,
        read_count: 0,
        acknowledged_count: announcement.requires_acknowledgment ? 0 : null,
        requires_acknowledgment: announcement.requires_acknowledgment,
        users: []
      };
    }

    // Get all announcement recipients with their read status
    const { data: recipients, error: recipientsError } = await supabase
      .from("announcement_recipients")
      .select(`
        announcement_id,
        user_id,
        read_at,
        acknowledged_at,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `);

    if (recipientsError) {
      console.error("Error fetching announcement recipients:", recipientsError);
      throw recipientsError;
    }

    // Process all recipients
    for (const recipient of recipients) {
      const announcementId = recipient.announcement_id;
      
      if (!statsMap[announcementId]) continue;
      
      statsMap[announcementId].total_users++;
      
      if (recipient.read_at) {
        statsMap[announcementId].read_count++;
      }
      
      if (recipient.acknowledged_at && statsMap[announcementId].acknowledged_count !== null) {
        statsMap[announcementId].acknowledged_count! += 1;
      }
      
      // Add user to the users array
      statsMap[announcementId].users.push({
        id: recipient.profiles?.id || recipient.user_id,
        name: recipient.profiles?.full_name || "Unknown User",
        avatar_url: recipient.profiles?.avatar_url,
        read: !!recipient.read_at,
        acknowledged: !!recipient.acknowledged_at,
        read_at: recipient.read_at,
        acknowledged_at: recipient.acknowledged_at
      });
    }

    return Object.values(statsMap);
  };

  return useQuery({
    queryKey: ["announcementStats"],
    queryFn: fetchAnnouncementStats,
    staleTime: 60000, // 1 minute
  });
};
