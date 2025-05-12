
import React from "react";
import { Input } from "@/components/ui/input";
import { ACCEPTED_TYPES, ContentType, MAX_FILE_SIZE, formatFileSize, validateFileSize } from "../utils/uploadUtils";
import { toast } from "sonner";

interface FileUploadInputProps {
  contentType: ContentType;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onError: (error: string | null) => void;
}

export const FileUploadInput: React.FC<FileUploadInputProps> = ({
  contentType,
  file,
  onFileChange,
  onError
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onError(null);
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Log the file size to help with debugging
      console.log(`Selected file size: ${formatFileSize(selectedFile.size)}, raw size: ${selectedFile.size} bytes`);
      
      const { isValid, errorMessage } = validateFileSize(selectedFile, MAX_FILE_SIZE);
      
      if (!isValid && errorMessage) {
        onError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      console.log(`File selected: ${selectedFile.name}, size: ${formatFileSize(selectedFile.size)}`);
      onFileChange(selectedFile);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">File</label>
      <div className="text-sm text-muted-foreground mb-2">
        Max file size: 90MB (Supabase storage limit is 100MB)
      </div>
      {file && (
        <div className="text-sm mb-2 p-2 bg-muted rounded-md">
          Selected: {file.name} ({formatFileSize(file.size)})
        </div>
      )}
      <Input
        required
        type="file"
        accept={ACCEPTED_TYPES[contentType]}
        onChange={handleFileChange}
      />
    </div>
  );
};
