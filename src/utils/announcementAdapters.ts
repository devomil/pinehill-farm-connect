
import { AnnouncementData } from "@/types/announcements";
import { AnnouncementStat } from "@/hooks/announcement/useAnnouncementStats";

/**
 * Converts AnnouncementStat objects to AnnouncementData format for compatibility with UI components
 */
export function convertAnnouncementStatToData(stats: AnnouncementStat[]): AnnouncementData[] {
  return stats.map(stat => ({
    id: stat.id,
    title: stat.title,
    total_users: stat.totalRecipients,
    read_count: stat.readCount,
    acknowledged_count: stat.acknowledgedCount,
    requires_acknowledgment: stat.requires_acknowledgment,
    created_at: stat.createdAt,
    users: stat.userDetails ? stat.userDetails.map(user => ({
      id: user.userId, // Map userId to id for compatibility
      name: user.name,
      avatar_url: undefined,
      email: user.email,
      read: user.read,
      acknowledged: user.acknowledged,
      read_at: undefined,
      acknowledged_at: undefined
    })) : []
  }));
}
