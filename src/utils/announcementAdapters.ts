
import { AnnouncementStat } from "@/hooks/announcement/useAnnouncementStats";

/**
 * Interface for announcement data used in the AnnouncementStatsDialog
 */
export interface AnnouncementData {
  id: string;
  title: string;
  total_users: number;
  read_count: number;
  acknowledged_count: number | null;
  requires_acknowledgment: boolean;
  created_at: string;
  users: {
    id: string;
    name: string;
    avatar_url?: string;
    read: boolean;
    acknowledged: boolean;
    read_at?: string;
    acknowledged_at?: string;
  }[];
}

/**
 * Converts AnnouncementStat array to AnnouncementData array
 * for use in the AnnouncementStatsDialog component
 */
export function convertAnnouncementStatToData(stats: AnnouncementStat[]): AnnouncementData[] {
  return stats.map(stat => ({
    id: stat.id,
    title: stat.title,
    total_users: stat.recipients?.length || 0,
    read_count: stat.recipients?.filter(r => r.read).length || 0,
    acknowledged_count: stat.recipients?.filter(r => r.acknowledged).length || 0,
    requires_acknowledgment: !!stat.requires_acknowledgment,
    created_at: stat.createdAt.toISOString(),
    users: stat.recipients?.map(recipient => ({
      id: recipient.user_id,
      name: recipient.user_name || 'Unknown User',
      avatar_url: recipient.avatar_url,
      read: recipient.read,
      acknowledged: recipient.acknowledged,
      read_at: recipient.read_at,
      acknowledged_at: recipient.acknowledged_at
    })) || []
  }));
}
