
import { toast } from "sonner";

// Constants for file uploads
// Reducing the maximum size to better match Supabase's limits
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB as Supabase may have stricter limits

export const ACCEPTED_TYPES = {
  image: "image/*",
  video: "video/*",
  audio: "audio/*"
};

export type ContentType = "image" | "video" | "audio";

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

// Validate file size
export const validateFileSize = (file: File, maxSize: number): { isValid: boolean; errorMessage?: string } => {
  if (file.size > maxSize) {
    const sizeMB = Math.round(maxSize / (1024 * 1024));
    const errorMessage = `File size (${formatFileSize(file.size)}) exceeds the ${sizeMB}MB limit`;
    return { isValid: false, errorMessage };
  }
  return { isValid: true };
};

// Generate unique filename 
export const generateUniqueFilename = (file: File): string => {
  const fileExt = file.name.split('.').pop();
  return `${Math.random().toString(36).substring(2)}${Date.now()}.${fileExt}`;
};
