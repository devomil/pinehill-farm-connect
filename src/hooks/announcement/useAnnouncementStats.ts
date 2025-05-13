
import { useState } from "react";
import { AnnouncementData } from "@/types/announcements";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAnnouncementStats = () => {
  const [error, setError] = useState<Error | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["announcement-stats"],
    queryFn: async () => {
      try {
        // Get all announcements with read status counts
        const { data, error: fetchError } = await supabase
          .from('announcements')
          .select(`
            id, 
            title,
            created_at,
            author_id,
            requires_acknowledgment,
            announcement_recipients(
              read_at,
              acknowledged_at,
              user_id
            )
          `);
          
        if (fetchError) {
          throw new Error(`Failed to fetch announcement stats: ${fetchError.message}`);
        }
        
        // Transform the data to match expected format
        const transformedData = (data || []).map(announcement => {
          const recipients = announcement.announcement_recipients || [];
          const totalRecipients = recipients.length;
          const readCount = recipients.filter(r => r.read_at).length;
          const acknowledgedCount = recipients.filter(r => r.acknowledged_at).length;
          
          return {
            id: announcement.id,
            title: announcement.title,
            created_at: announcement.created_at,
            author_id: announcement.author_id,
            requires_acknowledgment: announcement.requires_acknowledgment,
            total_users: totalRecipients,
            read_count: readCount,
            acknowledged_count: acknowledgedCount,
            read_percentage: totalRecipients > 0 ? Math.round((readCount / totalRecipients) * 100) : 0,
            acknowledged_percentage: totalRecipients > 0 ? Math.round((acknowledgedCount / totalRecipients) * 100) : 0,
            users: recipients.map(recipient => ({
              id: recipient.user_id || 'unknown',
              name: 'User', // Would need a join to get the name
              read: !!recipient.read_at,
              acknowledged: !!recipient.acknowledged_at,
              read_at: recipient.read_at,
              acknowledged_at: recipient.acknowledged_at
            }))
          } as AnnouncementData;
        });
        
        return transformedData;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return [];
      }
    }
  });

  return {
    stats: data || [],
    isLoading,
    error,
    refetch
  };
};
