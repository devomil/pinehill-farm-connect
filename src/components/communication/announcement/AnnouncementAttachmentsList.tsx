
import React from "react";
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";
import { AnnouncementAttachmentPreview } from "../AnnouncementAttachmentPreview";

interface AnnouncementAttachmentsListProps {
  attachments: { name: string; type: string; url?: string }[];
  onAttachmentAction: (attachment: { name: string; type: string; url?: string }) => void;
}

export const AnnouncementAttachmentsList = ({
  attachments,
  onAttachmentAction,
}: AnnouncementAttachmentsListProps) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      <h4 className="text-sm font-medium">Attachments:</h4>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => onAttachmentAction(attachment)}
            >
              <Paperclip className="h-3 w-3 mr-1" />
              {attachment.name}
            </Button>
            <AnnouncementAttachmentPreview attachment={attachment} />
          </div>
        ))}
      </div>
    </div>
  );
};
