
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnnouncementData } from "@/types/announcements";

export const useAnnouncementStats = () => {
  return useQuery({
    queryKey: ['announcement-stats'],
    queryFn: async () => {
      try {
        // Get total user count
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch announcements with basic data
        const { data: announcements, error: announcementError } = await supabase
          .from('announcements')
          .select(`
            id,
            title,
            requires_acknowledgment
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (announcementError) throw announcementError;

        // Process each announcement
        const processedAnnouncements = await Promise.all(announcements.map(async announcement => {
          // Get recipients for this announcement
          const { data: recipients, error: recipientsError } = await supabase
            .from('announcement_recipients')
            .select('read_at, acknowledged_at, user_id')
            .eq('announcement_id', announcement.id);
          
          if (recipientsError) {
            console.error("Error fetching recipients:", recipientsError);
            return null;
          }

          // Get user profiles for these recipients
          const userIds = recipients?.map(r => r.user_id) || [];
          
          let userProfiles = [];
          if (userIds.length > 0) {
            const { data: profiles, error: profilesError } = await supabase
              .from('profiles')
              .select('id, name, avatar_url')
              .in('id', userIds);
            
            if (profilesError) {
              console.error("Error fetching user profiles:", profilesError);
            } else {
              userProfiles = profiles || [];
            }
          }

          // Map user data with read/acknowledged status
          const users = userProfiles.map(profile => {
            const recipient = recipients?.find(r => r.user_id === profile.id);
            return {
              id: profile.id,
              name: profile.name || 'Unknown User',
              avatar_url: profile.avatar_url,
              read: recipient ? !!recipient.read_at : false,
              acknowledged: recipient ? !!recipient.acknowledged_at : false,
              read_at: recipient?.read_at,
              acknowledged_at: recipient?.acknowledged_at
            };
          });

          return {
            title: announcement.title,
            total_users: totalUsers || 0,
            read_count: recipients?.filter(r => r.read_at).length || 0,
            acknowledged_count: announcement.requires_acknowledgment 
              ? recipients?.filter(r => r.acknowledged_at).length || 0 
              : null,
            requires_acknowledgment: announcement.requires_acknowledgment,
            users
          };
        }));

        // Filter out any null results from processing errors
        return processedAnnouncements.filter(Boolean) as AnnouncementData[];
      } catch (error) {
        console.error("Error fetching announcement stats:", error);
        throw error;
      }
    }
  });
};
