
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AnnouncementData } from '@/types/announcements';

export const useAnnouncementStats = () => {
  return useQuery({
    queryKey: ['announcementStats'],
    queryFn: async (): Promise<AnnouncementData[]> => {
      // First get all announcements
      const { data: announcements, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (announcementsError) throw new Error(`Failed to fetch announcements: ${announcementsError.message}`);
      
      // Early return if no announcements
      if (!announcements || announcements.length === 0) return [];

      // For each announcement, get read receipts
      const statsPromises = announcements.map(async (announcement): Promise<AnnouncementData> => {
        // Get total user count
        const { count: totalUsers, error: countError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });

        if (countError) throw new Error(`Failed to count users: ${countError.message}`);

        // Get read receipts
        const { data: readReceipts, error: readError } = await supabase
          .from('announcement_recipients')
          .select('user_id, read_at, acknowledged_at')
          .eq('announcement_id', announcement.id);

        if (readError) throw new Error(`Failed to fetch read receipts: ${readError.message}`);
        
        // Count reads and acknowledgements
        const readCount = readReceipts?.filter(r => r.read_at !== null).length || 0;
        const acknowledgedCount = announcement.requires_acknowledgment 
          ? readReceipts?.filter(r => r.acknowledged_at !== null).length || 0
          : null;
        
        // Get detailed user data
        const { data: userDetails, error: userError } = await supabase
          .from('announcement_recipients')
          .select(`
            user_id,
            read_at,
            acknowledged_at,
            users:user_id (
              id,
              name: full_name,
              avatar_url
            )
          `)
          .eq('announcement_id', announcement.id);

        if (userError) {
          console.error("Error fetching user details:", userError);
          // Provide fallback user data
          const users = readReceipts?.map(r => ({
            id: r.user_id,
            name: "Unknown User",
            read: r.read_at !== null,
            acknowledged: r.acknowledged_at !== null,
            read_at: r.read_at,
            acknowledged_at: r.acknowledged_at
          })) || [];

          return {
            id: announcement.id,
            title: announcement.title,
            total_users: totalUsers || 0,
            read_count: readCount,
            acknowledged_count: acknowledgedCount,
            requires_acknowledgment: announcement.requires_acknowledgment,
            created_at: announcement.created_at,
            users
          };
        }

        // Map user details to the expected format
        const users = userDetails?.map(detail => {
          const user = detail.users as any;
          return {
            id: user?.id || detail.user_id,
            name: user?.name || "Unknown User",
            avatar_url: user?.avatar_url,
            read: detail.read_at !== null,
            acknowledged: detail.acknowledged_at !== null,
            read_at: detail.read_at,
            acknowledged_at: detail.acknowledged_at
          };
        }) || [];

        return {
          id: announcement.id,
          title: announcement.title,
          total_users: totalUsers || 0,
          read_count: readCount,
          acknowledged_count: acknowledgedCount,
          requires_acknowledgment: announcement.requires_acknowledgment,
          created_at: announcement.created_at,
          users
        };
      });
      
      return Promise.all(statsPromises);
    }
  });
};
