
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnnouncementStat {
  id: string;
  title: string;
  createdAt: string;
  totalRecipients: number;
  readCount: number;
  acknowledgedCount: number;
  readPercentage: number;
  priority: string;
  requires_acknowledgment: boolean;
  userDetails?: Array<{
    userId: string;
    name: string;
    email: string;
    read: boolean;
    acknowledged: boolean;
  }>;
}

export function useAnnouncementStats() {
  const query = useQuery({
    queryKey: ["announcement_stats"],
    queryFn: async () => {
      console.log("Fetching announcement stats...");
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select(`
            id,
            title,
            created_at,
            priority,
            requires_acknowledgment,
            announcement_recipients(
              read_at,
              acknowledged_at,
              user_id
            )
          `);
          
        if (error) {
          console.error("Error fetching announcement stats", error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.log("No announcement data found");
          return [];
        }
        
        console.log(`Found ${data.length} announcements`);
        
        // Get user details for easier display
        const userIds = new Set<string>();
        data.forEach(ann => {
          if (ann.announcement_recipients) {
            ann.announcement_recipients.forEach((rec: any) => {
              if (rec.user_id) userIds.add(rec.user_id);
            });
          }
        });
        
        if (userIds.size === 0) {
          console.log("No user IDs found in recipients");
        } else {
          console.log(`Found ${userIds.size} unique recipient user IDs`);
        }
        
        const { data: users, error: usersError } = await supabase
          .from("profiles")
          .select("id, name, email")
          .in("id", Array.from(userIds));
          
        if (usersError) {
          console.error("Error fetching user details", usersError);
        }
        
        const usersMap = new Map();
        if (users) {
          users.forEach(user => {
            usersMap.set(user.id, user);
          });
        }
        
        const stats: AnnouncementStat[] = data.map(announcement => {
          const recipients = announcement.announcement_recipients || [];
          const readCount = recipients.filter((r: any) => r.read_at).length;
          const acknowledgedCount = recipients.filter((r: any) => r.acknowledged_at).length;
          const totalRecipients = recipients.length || 0;
          
          const userDetails = recipients.map((r: any) => {
            const user = usersMap.get(r.user_id);
            return {
              userId: r.user_id,
              name: user?.name || "Unknown",
              email: user?.email || "Unknown",
              read: !!r.read_at,
              acknowledged: !!r.acknowledged_at
            };
          });
          
          return {
            id: announcement.id,
            title: announcement.title,
            createdAt: announcement.created_at,
            priority: announcement.priority,
            requires_acknowledgment: announcement.requires_acknowledgment,
            totalRecipients,
            readCount,
            acknowledgedCount,
            readPercentage: totalRecipients > 0 ? Math.round((readCount / totalRecipients) * 100) : 0,
            userDetails
          };
        });
        
        console.log(`Processed ${stats.length} announcement stats`);
        return stats;
      } catch (error) {
        console.error("Error fetching announcement stats:", error);
        throw error;
      }
    },
    // Add proper caching and stale time configuration to prevent too frequent refetches
    staleTime: 300000, // 5 minutes (increased from 1 minute)
    refetchInterval: false, // Disable automatic refetching
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: true, // Only fetch once on mount
    retry: 1, // Limit retries to prevent excessive api calls
  });

  return {
    stats: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}
