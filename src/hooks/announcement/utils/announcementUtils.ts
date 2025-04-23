
import { Announcement, User } from "@/types";

export const mapAnnouncementData = (annData: any[], allEmployees: User[]): Announcement[] => {
  return (annData || []).map((a: any) => {
    const author = allEmployees.find(x => x.id === a.author_id);
    return {
      id: a.id,
      title: a.title,
      content: a.content,
      createdAt: a.created_at ? new Date(a.created_at) : new Date(),
      author: author?.name || "Unknown",
      priority: a.priority,
      readBy: [],
      hasQuiz: !!a.has_quiz,
      requires_acknowledgment: a.requires_acknowledgment,
      attachments: Array.isArray(a.attachments) ? a.attachments : [],
      target_type: a.target_type,
    };
  });
};

export const updateAnnouncementReadStatus = (
  announcements: Announcement[],
  reads: any[],
  currentUserId: string
): Announcement[] => {
  return announcements.map(a => ({
    ...a,
    readBy: reads.some((rec: any) => rec.announcement_id === a.id && rec.read_at) 
      ? [currentUserId]
      : []
  }));
};
