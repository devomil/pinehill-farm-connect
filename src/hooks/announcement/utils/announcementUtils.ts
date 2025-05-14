
import { Announcement, User } from "@/types";

export const mapAnnouncementData = (annData: any, currentUserId?: string): Announcement => {
  if (!annData) {
    console.warn("Invalid announcement data received:", annData);
    return {
      id: '',
      title: "Untitled",
      content: "",
      createdAt: new Date(),
      author: "Unknown",
      priority: "fyi",
      readBy: [],
      hasQuiz: false,
      requires_acknowledgment: false,
      attachments: [],
      target_type: "all",
      acknowledgements: [],
      currentUserId
    };
  }
  
  return {
    id: annData.id,
    title: annData.title || "Untitled",
    content: annData.content || "",
    createdAt: annData.created_at ? new Date(annData.created_at) : new Date(),
    author: annData.author_name || "Unknown",
    priority: annData.priority || "fyi",
    readBy: [],
    hasQuiz: !!annData.has_quiz,
    requires_acknowledgment: annData.requires_acknowledgment || false,
    attachments: Array.isArray(annData.attachments) ? annData.attachments : [],
    target_type: annData.target_type || "all",
    acknowledgements: [], // Initialize empty array for acknowledgements
    currentUserId // Add currentUserId to announcement for easy access
  };
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
  
  console.log("Updating read status with records:", reads, "for user:", currentUserId);
  
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

// Safe helper to get readBy array
export const getAnnouncementReadBy = (announcement: any): string[] => {
  // If it already has a readBy array, return it
  if (Array.isArray(announcement.readBy)) {
    return announcement.readBy;
  }
  
  // For raw announcements from database, check if we have read receipts
  // and return an empty array as default
  return [];
};

// Safe helper to check if an announcement is read by a specific user
export const isAnnouncementReadByUser = (announcement: any, userId: string | undefined): boolean => {
  if (!userId) return false;
  
  const readBy = getAnnouncementReadBy(announcement);
  return readBy.includes(userId);
};
