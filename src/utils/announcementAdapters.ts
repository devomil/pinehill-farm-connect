
import { AnnouncementStat as IndexAnnouncementStat } from "@/types";
import { AnnouncementStat as HookAnnouncementStat } from "@/hooks/announcement/useAnnouncementStats";

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
 * Adapter function to convert hook's AnnouncementStat format to the index.ts AnnouncementStat format
 */
export function convertHookStatsToIndexFormat(stats: HookAnnouncementStat[]): IndexAnnouncementStat[] {
  return stats.map(stat => ({
    id: stat.id,
    title: stat.title,
    total_users: stat.totalRecipients || 0,
    read_count: stat.readCount || 0,
    acknowledged_count: stat.acknowledgedCount || 0,
    created_at: stat.createdAt || new Date().toISOString(),
    requires_acknowledgment: !!stat.requires_acknowledgment,
    users: stat.userDetails?.map(user => ({
      id: user.userId,
      name: user.name || 'Unknown User',
      read: user.read || false,
      acknowledged: user.acknowledged || false
    })) || []
  }));
}

/**
 * Converts AnnouncementStat array to AnnouncementData array for UI rendering
 */
export function convertAnnouncementStatsToData(stats: IndexAnnouncementStat[]): AnnouncementData[] {
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
