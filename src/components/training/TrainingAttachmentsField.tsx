
import React, { useState } from "react";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Paperclip, X, FileText } from "lucide-react";
import { toast } from "sonner";

interface TrainingAttachmentsFieldProps {
  value: string[];
  onChange: (attachments: string[]) => void;
}

export const TrainingAttachmentsField: React.FC<TrainingAttachmentsFieldProps> = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const attachments: string[] = [...value];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size and type
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large (max 5MB)`);
          continue;
        }
        
        // Check if it's a PDF, Word doc, or plain text
        const validTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ];
        
        if (!validTypes.includes(file.type)) {
          toast.error(`File ${file.name} type not supported (PDF, Word, or text only)`);
          continue;
        }
        
        // Read the file
        const reader = new FileReader();
        const attachment = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        
        attachments.push(attachment);
      }
      
      onChange(attachments);
      toast.success("Files added successfully");
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error uploading files");
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...value];
    newAttachments.splice(index, 1);
    onChange(newAttachments);
  };

  return (
    <FormItem>
      <FormLabel>Training Materials (PDF, Word, Text - max 5MB each)</FormLabel>
      <FormControl>
        <div className="space-y-4">
          <Input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            disabled={uploading}
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          
          {value && value.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {value.map((attachment, idx) => {
                const isDataUrl = attachment.startsWith('data:');
                const fileType = isDataUrl ? attachment.split(';')[0].split(':')[1] : 'unknown';
                const fileName = isDataUrl ? `Document ${idx + 1}` : attachment.split('/').pop();
                
                return (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1 py-1 px-2">
                    <FileText className="h-3 w-3" />
                    <span className="max-w-[150px] truncate">{fileName}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1 p-0" 
                      onClick={() => removeAttachment(idx)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
