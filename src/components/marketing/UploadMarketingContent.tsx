
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { ContentTypeSelector } from "./components/ContentTypeSelector";
import { FileUploadInput } from "./components/FileUploadInput";
import { UploadError } from "./components/UploadError";
import { ContentType, MAX_FILE_SIZE } from "./utils/uploadUtils";
import { uploadContent } from "./services/uploadService";

interface UploadMarketingContentProps {
  onUploadComplete: () => void;
}

export const UploadMarketingContent: React.FC<UploadMarketingContentProps> = ({ onUploadComplete }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<ContentType>("image");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      toast.error("Please provide a title and select a file");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Check again file size before attempting upload
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
      }

      await uploadContent({
        file,
        title,
        description,
        contentType
      });
      
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
      } else if (error.message?.includes("exceeded the maximum allowed size")) {
        toast.error("File size exceeds the server limit. Please select a smaller file.");
      } else {
        toast.error("Error uploading content. Please try again with a smaller file.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <UploadError error={error} />
      
      <ContentTypeSelector 
        value={contentType} 
        onValueChange={(value) => {
          setContentType(value);
          setFile(null);
          setError(null);
        }}
      />

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

      <FileUploadInput
        contentType={contentType}
        file={file}
        onFileChange={setFile}
        onError={setError}
      />

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
