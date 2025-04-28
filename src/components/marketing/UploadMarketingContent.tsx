
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";

interface UploadMarketingContentProps {
  onUploadComplete: () => void;
}

export const UploadMarketingContent: React.FC<UploadMarketingContentProps> = ({ onUploadComplete }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<"image" | "video">("image");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      toast.error("Please provide a title and select a file");
      return;
    }

    try {
      setUploading(true);

      // Upload file to storage bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('marketing_content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('marketing_content')
        .getPublicUrl(filePath);

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

      if (dbError) throw dbError;

      toast.success("Content uploaded successfully");
      setTitle("");
      setDescription("");
      setFile(null);
      onUploadComplete();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error uploading content");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Content Type</label>
        <Select value={contentType} onValueChange={(value: "image" | "video") => setContentType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select content type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
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
        <Input
          required
          type="file"
          accept={contentType === "image" ? "image/*" : "video/*"}
          onChange={handleFileChange}
        />
      </div>

      <Button type="submit" disabled={uploading}>
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
