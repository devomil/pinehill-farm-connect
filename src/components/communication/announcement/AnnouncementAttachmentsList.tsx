
import React from "react";
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";
import { AnnouncementAttachmentPreview } from "../AnnouncementAttachmentPreview";
import { useToast } from "@/hooks/use-toast";

interface AnnouncementAttachmentsListProps {
  attachments: { name: string; type: string; url?: string; size?: number }[];
  onAttachmentAction?: (attachment: { name: string; type: string; url?: string }) => void;
}

export const AnnouncementAttachmentsList = ({
  attachments,
  onAttachmentAction,
}: AnnouncementAttachmentsListProps) => {
  const { toast } = useToast();

  if (!attachments || attachments.length === 0) return null;

  const handleAttachmentClick = (attachment: { name: string; type: string; url?: string }) => {
    if (onAttachmentAction) {
      onAttachmentAction(attachment);
    } else if (attachment.url) {
      try {
        window.open(attachment.url, '_blank');
      } catch (error) {
        console.error('Error opening attachment:', error);
        toast({
          title: "Could not open attachment",
          description: "There was an issue opening the attachment",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Could not open attachment",
        description: "The attachment URL is missing",
        variant: "destructive"
      });
    }
  };

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
              onClick={() => handleAttachmentClick(attachment)}
            >
              <Paperclip className="h-3 w-3 mr-1" />
              {attachment.name}
            </Button>
            <AnnouncementAttachmentPreview 
              attachment={attachment} 
              onAttachmentAction={onAttachmentAction}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
