
import React from "react";
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";
import { AnnouncementAttachmentPreview } from "@/components/communication/AnnouncementAttachmentPreview";

interface AnnouncementAttachmentsListProps {
  attachments: { name: string; type: string; url?: string; size?: number }[];
  onAttachmentAction?: (attachment: { name: string; type: string; url?: string }) => void;
  compact?: boolean;
}

export const AnnouncementAttachmentsList = ({
  attachments,
  onAttachmentAction,
  compact = false,
}: AnnouncementAttachmentsListProps) => {
  if (!attachments || attachments.length === 0) return null;

  const handleAttachmentClick = (attachment: { name: string; type: string; url?: string }) => {
    if (onAttachmentAction) {
      console.log("Calling onAttachmentAction from AttachmentsList");
      onAttachmentAction(attachment);
    }
  };

  return (
    <div className="space-y-2 mb-4">
      <h4 className="text-sm font-medium">Attachments:</h4>
      <div className={`flex flex-wrap gap-2 ${compact ? 'items-center' : ''}`}>
        {attachments.map((attachment, idx) => (
          <div key={idx} className={`flex ${compact ? 'items-center w-full justify-between' : 'flex-col sm:flex-row items-start sm:items-center'} gap-2`}>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => handleAttachmentClick(attachment)}
            >
              <Paperclip className="h-3 w-3 mr-1" />
              {attachment.name}
            </Button>
            <AnnouncementAttachmentPreview 
              attachment={attachment} 
              onAttachmentAction={onAttachmentAction}
              compact={compact}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
