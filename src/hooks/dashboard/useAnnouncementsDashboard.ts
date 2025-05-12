
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { transformRawAnnouncements } from "@/utils/announcementUtils";

/**
 * Hook for fetching announcements data for the dashboard
 */
export function useAnnouncementsDashboard(
  currentUser: any | null,
  retryCount: number
) {
  // Fetch recent announcements
  const { data: rawAnnouncements, error: announcementsError, refetch: refetchAnnouncements } = useQuery({
    queryKey: ['recentAnnouncements', retryCount],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
    retry: 3
  });
  
  // Transform raw announcements to include readBy field
  const announcements = rawAnnouncements ? 
    transformRawAnnouncements(rawAnnouncements, currentUser?.id) :
    [];

  // Fetch announcement read status for current user
  const { data: readReceipts } = useQuery({
    queryKey: ['announcementReadReceipts', currentUser?.id, retryCount],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      
      const { data, error } = await supabase
        .from('announcement_recipients')
        .select('*')
        .eq('user_id', currentUser.id);
        
      if (error) {
        console.error("Error fetching announcement receipts:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!currentUser?.id,
    staleTime: 30000
  });
  
  // Apply read receipts to announcements
  if (readReceipts && announcements) {
    announcements.forEach(announcement => {
      const receipt = readReceipts.find(r => r.announcement_id === announcement.id);
      if (receipt?.read_at && currentUser?.id && !announcement.readBy.includes(currentUser.id)) {
        announcement.readBy.push(currentUser.id);
      }
    });
  }

  return {
    announcements,
    rawAnnouncements,
    announcementsError,
    refetchAnnouncements,
    loading: !rawAnnouncements
  };
}
