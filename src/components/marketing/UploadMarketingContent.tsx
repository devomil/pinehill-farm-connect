
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface UploadMarketingContentProps {
  onUploadComplete: () => void;
}

export const UploadMarketingContent: React.FC<UploadMarketingContentProps> = ({ onUploadComplete }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<"image" | "video" | "audio">("image");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Maximum file sizes in bytes (increased to 200MB for all types)
  const MAX_FILE_SIZE = 200 * 1024 * 1024;  // 200MB for all content types

  const ACCEPTED_TYPES = {
    image: "image/*",
    video: "video/*",
    audio: "audio/*"
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.size > MAX_FILE_SIZE) {
        const sizeMB = Math.round(MAX_FILE_SIZE / (1024 * 1024));
        const errorMessage = `File size exceeds the ${sizeMB}MB limit`;
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      console.log(`File selected: ${selectedFile.name}, size: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`);
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      toast.error("Please provide a title and select a file");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      console.log(`Starting upload for ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

      // Generate a unique filename to prevent collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log(`Uploading to storage path: ${filePath}`);

      // Check again file size before attempting upload
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
      }

      // Upload file to storage bucket with controlled chunk size
      const { error: uploadError, data } = await supabase.storage
        .from('marketing_content')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error details:", uploadError);
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
      toast.success("Content uploaded successfully");
      setTitle("");
      setDescription("");
      setFile(null);
      onUploadComplete();
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage = error.message || "Unknown error during upload";
      setError(`Error: ${errorMessage}`);
      
      if (error.message?.includes("Payload too large")) {
        toast.error("File is too large for upload. Please select a smaller file.");
      } else {
        toast.error("Error uploading content. Please try again with a smaller file.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1">Content Type</label>
        <Select value={contentType} onValueChange={(value: "image" | "video" | "audio") => {
          setContentType(value);
          setFile(null); // Reset file when changing content type
          setError(null);
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select content type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter content title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description (optional)</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter content description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">File</label>
        <div className="text-sm text-muted-foreground mb-2">
          Max file size: 200MB
        </div>
        {file && (
          <div className="text-sm mb-2 p-2 bg-muted rounded-md">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
          </div>
        )}
        <Input
          required
          type="file"
          accept={ACCEPTED_TYPES[contentType]}
          onChange={handleFileChange}
        />
      </div>

      <Button type="submit" disabled={uploading || !file}>
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Upload Content
          </>
        )}
      </Button>
    </form>
  );
};
