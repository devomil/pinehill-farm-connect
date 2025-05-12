
import { supabase } from "@/integrations/supabase/client";
import { generateUniqueFilename } from "../utils/uploadUtils";
import { toast } from "sonner";

interface UploadContentParams {
  file: File;
  title: string;
  description: string;
  contentType: "image" | "video" | "audio";
}

export const uploadContent = async ({
  file,
  title,
  description,
  contentType
}: UploadContentParams) => {
  console.log(`Starting upload for ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB, raw bytes: ${file.size}`);

  // Check file size early with a more conservative limit
  const safeLimit = 90 * 1024 * 1024; // 90MB to be safe
  if (file.size > safeLimit) {
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the safe limit of 90MB. Please select a smaller file.`);
  }

  // Generate a unique filename to prevent collisions
  const filePath = generateUniqueFilename(file);

  console.log(`Uploading to storage path: ${filePath}`);

  // Try up to 3 times to upload
  let attempt = 0;
  const maxAttempts = 3;
  let lastError = null;
  
  while (attempt < maxAttempts) {
    attempt++;
    try {
      // Upload file to storage bucket with chunking for larger files
      const { error: uploadError, data } = await supabase.storage
        .from('marketing_content')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error(`Upload attempt ${attempt} error:`, uploadError);
        
        // If we hit the size limit, don't retry
        if (uploadError.message?.includes("exceeded the maximum allowed size") ||
            uploadError.message?.includes("Payload too large") ||
            uploadError.message?.includes("too large")) {
          throw new Error(`File size appears to exceed Supabase's limits. Please use a file smaller than 90MB. Error: ${uploadError.message}`);
        }
        
        // For other errors, retry after a delay
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        throw uploadError;
      }

      console.log("File uploaded successfully, getting public URL");
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('marketing_content')
        .getPublicUrl(filePath);

      console.log("Public URL obtained:", publicUrl);

      // Insert record in marketing_content table
      const { error: dbError } = await supabase
        .from('marketing_content')
        .insert({
          title,
          description,
          content_type: contentType,
          url: publicUrl,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          is_active: true
        });

      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }

      console.log("Database record created successfully");
      return { success: true, publicUrl };
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts) {
        console.error(`Failed after ${maxAttempts} attempts`, error);
        throw error;
      }
    }
  }
  
  throw lastError;
};
