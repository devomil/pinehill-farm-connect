import React from "react";
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";
import { AnnouncementAttachmentPreview } from "@/components/communication/AnnouncementAttachmentPreview";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const { toast } = useToast();

  if (!attachments || attachments.length === 0) return null;

  const handleAttachmentClick = async (attachment: { name: string; type: string; url?: string }) => {
    try {
      // If we have a URL, use it directly
      if (attachment.url) {
        window.open(attachment.url, '_blank');
        return;
      }
      
      // Otherwise, get a signed URL from Supabase storage
      // Note: Fixed path here - using just the name instead of attachments/name
      const { data, error } = await supabase
        .storage
        .from('announcements')
        .createSignedUrl(`${attachment.name}`, 3600); // 1 hour expiry
      
      if (error) {
        console.error('Error creating signed URL:', error);
        toast({
          title: "Could not open attachment",
          description: "There was an issue accessing the attachment",
          variant: "destructive"
        });
        return;
      }

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error handling attachment:', error);
      toast({
        title: "Could not open attachment",
        description: "There was an issue accessing the attachment",
        variant: "destructive"
      });
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
