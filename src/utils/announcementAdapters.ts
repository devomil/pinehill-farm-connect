
import { AnnouncementStat } from "@/hooks/announcement/useAnnouncementStats";

/**
 * Interface for announcement data used in the AnnouncementStatsDialog
 */
export interface AnnouncementData {
  id: string;
  title: string;
  total_users: number;
  read_count: number;
  acknowledged_count: number;
  created_at: string;
  users: {
    id: string;
    name: string;
    read: boolean;
    acknowledged: boolean;
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
    created_at: stat.created_at,
    users: stat.recipients?.map(recipient => ({
      id: recipient.user_id,
      name: recipient.user_name || 'Unknown User',
      read: recipient.read,
      acknowledged: recipient.acknowledged
    })) || []
  }));
}
