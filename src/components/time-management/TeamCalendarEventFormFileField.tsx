
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileIcon, Paperclip, X } from 'lucide-react';
import { UseFormReturn } from "react-hook-form";
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";

// Define props interface for the component
export interface TeamCalendarEventFormFileFieldProps {
  name: string;
  label: string;
  form: UseFormReturn<any>;
}

export const TeamCalendarEventFormFileField: React.FC<TeamCalendarEventFormFileFieldProps> = ({ 
  form,
  name,
  label
}) => {
  const files = form.watch(name) || [];
  
  const setFiles = (newFiles: File[]) => {
    form.setValue(name, newFiles, { shouldValidate: true });
  };
  
  const disabled = form.formState.isSubmitting;
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles([...files, ...acceptedFiles]);
  }, [files, setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    disabled 
  });

  const removeFile = (fileToRemove: File) => {
    const updatedFiles = files.filter((file: File) => file !== fileToRemove);
    setFiles(updatedFiles);
  };

  const handleDownload = (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
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
      <label className="font-medium text-sm">{label}</label>
      <div 
        {...getRootProps({ 
          className: `block mt-1 mb-2 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`
        })}
      >
        <Button asChild size="sm" variant="outline" disabled={disabled}>
          <span>
            <Paperclip className="h-4 w-4 mr-1 inline" /> {isDragActive ? "Drop it here!" : "Add Attachment"}
            <input {...getInputProps()} />
          </span>
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {files.map((file: File, idx: number) => (
          <div key={idx} className="flex items-center bg-muted px-2 py-1 rounded text-xs">
            <FileIcon className="h-3 w-3 mr-1" />
            <span className="truncate max-w-[150px]">{file.name}</span>
            <button
              type="button"
              className="ml-1 text-muted-foreground hover:text-destructive"
              onClick={() => removeFile(file)}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
