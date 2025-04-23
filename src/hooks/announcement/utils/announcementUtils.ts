
import { Announcement, User } from "@/types";

export const mapAnnouncementData = (annData: any[], allEmployees: User[]): Announcement[] => {
  if (!annData || !Array.isArray(annData)) {
    console.warn("Invalid announcement data received:", annData);
    return [];
  }
  
  return annData.map((a: any) => {
    const author = allEmployees.find(x => x.id === a.author_id);
    return {
      id: a.id,
      title: a.title || "Untitled",
      content: a.content || "",
      createdAt: a.created_at ? new Date(a.created_at) : new Date(),
      author: author?.name || "Unknown",
      priority: a.priority || "fyi",
      readBy: [],
      hasQuiz: !!a.has_quiz,
      requires_acknowledgment: a.requires_acknowledgment || false,
      attachments: Array.isArray(a.attachments) ? a.attachments : [],
      target_type: a.target_type || "all",
    };
  });
};

export const updateAnnouncementReadStatus = (
  announcements: Announcement[],
  reads: any[],
  currentUserId: string
): Announcement[] => {
  if (!Array.isArray(reads) || !Array.isArray(announcements)) {
    console.warn("Invalid data for updateAnnouncementReadStatus:", { announcements, reads });
    return announcements;
  }
  
  return announcements.map(a => ({
    ...a,
    readBy: reads.some((rec: any) => rec.announcement_id === a.id && rec.read_at) 
      ? [currentUserId, ...(a.readBy || []).filter(id => id !== currentUserId)]
      : (a.readBy || [])
  }));
};
