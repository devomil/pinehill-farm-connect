
import { AnnouncementStat, Announcement } from "@/types";

/**
 * AnnouncementData represents the processed data needed for displaying
 * announcement statistics in the dashboard and admin interfaces
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
 * Converts AnnouncementStat array to AnnouncementData array for UI rendering
 */
export function convertAnnouncementStatsToData(stats: AnnouncementStat[]): AnnouncementData[] {
  return stats.map(stat => ({
    id: stat.id,
    title: stat.title,
    total_users: stat.total_users || 0,
    read_count: stat.read_count || 0,
    acknowledged_count: stat.acknowledged_count || 0,
    requires_acknowledgment: !!stat.requires_acknowledgment,
    created_at: stat.created_at || new Date().toISOString(),
    users: stat.users?.map(user => ({
      id: user.id,
      name: user.name || 'Unknown User',
      avatar_url: user.avatar_url,
      read: user.read || false,
      acknowledged: user.acknowledged || false,
      read_at: user.read_at,
      acknowledged_at: user.acknowledged_at
    })) || []
  }));
}
