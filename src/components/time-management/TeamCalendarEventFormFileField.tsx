
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";

// Define props interface for the component
export interface TeamCalendarEventFormFileFieldProps {
  files: File[];
  setFiles: (files: File[]) => void;
  disabled?: boolean;
}

export const TeamCalendarEventFormFileField: React.FC<TeamCalendarEventFormFileFieldProps> = ({ 
  files, 
  setFiles, 
  disabled 
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles([...files, ...acceptedFiles]);
  }, [files, setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    disabled 
  });

  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  const handleDownload = async (file: File) => {
    try {
      const url = window.URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        description: "There was an error downloading the file",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <label className="font-medium text-sm">Attachments</label>
      <div 
        {...getRootProps({ 
          className: `block mt-1 mb-2 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`
        })}
      >
        <Button asChild size="sm" variant="outline" disabled={disabled}>
          <span>
            <Paperclip className="h-4 w-4 mr-1 inline" /> {isDragActive ? "Drop it here!" : "Add Attachment"}
            <input {...getInputProps()} className="hidden" disabled={disabled} />
          </span>
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {files.map((file, idx) => (
          <div key={idx} className="flex items-center bg-muted px-2 py-1 rounded text-xs">
            <span>{file.name}</span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="ml-1 px-1"
              onClick={() => removeFile(file)}
              disabled={disabled}
            >
              ✕
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="ml-1 px-1"
              onClick={() => handleDownload(file)}
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4 mr-1 inline" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
