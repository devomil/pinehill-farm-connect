
import { useState } from "react";
import { AnnouncementData } from "@/types/announcements";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAnnouncementStats = () => {
  const [error, setError] = useState<Error | null>(null);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ["announcement-stats"],
    queryFn: async () => {
      try {
        // Get all announcements with read status counts
        const { data, error: fetchError } = await supabase
          .rpc('get_announcement_stats')
          .select('*');
          
        if (fetchError) {
          throw new Error(`Failed to fetch announcement stats: ${fetchError.message}`);
        }
        
        // If there's no RPC function, fallback to this query
        if (!data) {
          // Join announcements with recipients to get read counts
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('announcements')
            .select(`
              id, 
              title,
              created_at,
              author_id,
              requires_acknowledgment,
              announcement_recipients(
                read_at,
                acknowledged_at
              )
            `);
            
          if (fallbackError) {
            throw new Error(`Failed to fetch announcements: ${fallbackError.message}`);
          }
          
          // Transform the data to match expected format
          const transformedData = (fallbackData || []).map(announcement => {
            const recipients = announcement.announcement_recipients || [];
            const totalRecipients = recipients.length;
            const readCount = recipients.filter(r => r.read_at).length;
            const acknowledgedCount = recipients.filter(r => r.acknowledged_at).length;
            
            return {
              id: announcement.id,
              title: announcement.title,
              date: announcement.created_at,
              authorId: announcement.author_id,
              requiresAcknowledgment: announcement.requires_acknowledgment,
              totalRecipients,
              readCount,
              readPercentage: totalRecipients > 0 ? Math.round((readCount / totalRecipients) * 100) : 0,
              acknowledgedPercentage: totalRecipients > 0 ? Math.round((acknowledgedCount / totalRecipients) * 100) : 0
            };
          });
          
          return transformedData as AnnouncementData[];
        }
        
        return data as AnnouncementData[];
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return [];
      }
    }
  });

  return {
    stats: stats || [],
    isLoading,
    error,
    refetch
  };
};
