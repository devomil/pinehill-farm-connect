
import { toast } from "sonner";

// Constants for file uploads
export const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB for all content types

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
    const errorMessage = `File size exceeds the ${sizeMB}MB limit`;
    return { isValid: false, errorMessage };
  }
  return { isValid: true };
};

// Generate unique filename 
export const generateUniqueFilename = (file: File): string => {
  const fileExt = file.name.split('.').pop();
  return `${Math.random().toString(36).substring(2)}${Date.now()}.${fileExt}`;
};
