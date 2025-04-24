
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
      acknowledgements: [] // Initialize empty array for acknowledgements
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
  
  return announcements.map(a => {
    // Find recipients record for this announcement
    const recipientRecord = reads.find((rec: any) => rec.announcement_id === a.id);
    
    // Set read status
    const isRead = recipientRecord && recipientRecord.read_at;
    const readBy = isRead 
      ? [currentUserId, ...(a.readBy || []).filter(id => id !== currentUserId)]
      : (a.readBy || []);
    
    // Set acknowledgement status
    const isAcknowledged = recipientRecord && recipientRecord.acknowledged_at;
    const acknowledgements = isAcknowledged
      ? [currentUserId, ...(a.acknowledgements || []).filter(id => id !== currentUserId)]
      : (a.acknowledgements || []);
    
    return {
      ...a,
      readBy,
      acknowledgements,
      currentUserId // Add currentUserId to each announcement for easy access
    };
  });
};
