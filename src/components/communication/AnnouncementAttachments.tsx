
import React from "react";
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";

interface AnnouncementAttachmentsProps {
  attachments: File[];
  onAttachmentsChange: (attachments: File[]) => void;
  disabled?: boolean;
}

export const AnnouncementAttachments: React.FC<AnnouncementAttachmentsProps> = ({
  attachments,
  onAttachmentsChange,
  disabled
}) => {
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    onAttachmentsChange([...attachments, ...Array.from(files)]);
  };

  const removeAttachment = (index: number) => {
    onAttachmentsChange(attachments.filter((_, idx) => idx !== index));
  };

  return (
    <div>
      <label className="font-medium text-sm">Attachments</label>
      <label className="block mt-1 mb-2">
        <Button asChild size="sm" variant="outline">
          <span>
            <Paperclip className="h-4 w-4 mr-1 inline" /> Add Attachment
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
              disabled={disabled}
            />
          </span>
        </Button>
      </label>
      <div className="flex flex-wrap gap-2">
        {attachments.map((file, idx) => (
          <div key={idx} className="flex items-center bg-muted px-2 py-1 rounded text-xs">
            <span>{file.name}</span>
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              className="ml-1 px-1"
              onClick={() => removeAttachment(idx)}
              disabled={disabled}
            >✕</Button>
          </div>
        ))}
      </div>
    </div>
  );
};
