
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAnnouncementStats = () => {
  return useQuery({
    queryKey: ['announcement-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          id,
          title,
          created_at,
          priority,
          requires_acknowledgment,
          announcement_recipients(count)
        `);

      if (error) {
        console.error('Error fetching announcement stats:', error);
        throw error;
      }

      const { data: readStats, error: readStatsError } = await supabase
        .from('announcement_recipients')
        .select('announcement_id, count(*)')
        .not('read_at', 'is', null)
        .group('announcement_id');

      if (readStatsError) {
        console.error('Error fetching read stats:', readStatsError);
        throw readStatsError;
      }

      // Process data into stats format
      const stats = data.map(announcement => {
        const readCount = readStats?.find(s => s.announcement_id === announcement.id)?.count || 0;
        const totalRecipientCount = announcement.announcement_recipients[0]?.count || 0;
        
        return {
          id: announcement.id,
          title: announcement.title,
          created_at: announcement.created_at,
          priority: announcement.priority,
          requires_acknowledgment: announcement.requires_acknowledgment,
          readCount: parseInt(readCount),
          totalRecipients: parseInt(totalRecipientCount),
          readPercentage: totalRecipientCount > 0 
            ? Math.round((parseInt(readCount) / parseInt(totalRecipientCount)) * 100) 
            : 0
        };
      });

      return stats;
    },
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
  });
};
