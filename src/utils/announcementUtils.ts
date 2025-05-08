
import { Announcement } from "@/types";

/**
 * Safely get readBy array from an announcement object
 * This handles both raw database announcements and processed Announcement types
 */
export const getAnnouncementReadBy = (announcement: any): string[] => {
  // If it already has a readBy array, return it
  if (Array.isArray(announcement.readBy)) {
    return announcement.readBy;
  }
  
  // For raw announcements from database, check if we have read receipts
  // and return an empty array as default
  return [];
};

/**
 * Safely check if an announcement is read by a specific user
 */
export const isAnnouncementReadByUser = (announcement: any, userId: string | undefined): boolean => {
  if (!userId) return false;
  
  const readBy = getAnnouncementReadBy(announcement);
  return readBy.includes(userId);
};

/**
 * Transform raw announcements from the database into our Announcement type
 */
export const transformRawAnnouncements = (rawAnnouncements: any[], currentUserId?: string): Announcement[] => {
  if (!Array.isArray(rawAnnouncements)) return [];
  
  return rawAnnouncements.map(raw => ({
    id: raw.id,
    title: raw.title || "",
    content: raw.content || "",
    createdAt: new Date(raw.created_at),
    author: raw.author_name || "Unknown", // May need to be fetched separately
    priority: raw.priority || "fyi",
    readBy: Array.isArray(raw.readBy) ? raw.readBy : [],
    hasQuiz: !!raw.has_quiz,
    requires_acknowledgment: !!raw.requires_acknowledgment,
    attachments: Array.isArray(raw.attachments) ? raw.attachments : [],
    target_type: raw.target_type || "all",
    currentUserId: currentUserId
  }));
};
