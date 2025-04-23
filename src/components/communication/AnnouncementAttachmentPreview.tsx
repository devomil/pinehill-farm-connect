
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Download } from "lucide-react";

interface AttachmentPreviewProps {
  attachment: { name: string; type: string; url?: string };
}

export const AnnouncementAttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachment }) => {
  const isImage = attachment.type?.startsWith('image/');
  const isPdf = attachment.type === 'application/pdf';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <div className="h-full overflow-auto p-4">
          {isImage && attachment.url && (
            <img 
              src={attachment.url} 
              alt={attachment.name}
              className="max-w-full h-auto"
            />
          )}
          {isPdf && attachment.url && (
            <iframe
              src={attachment.url}
              className="w-full h-full"
              title={attachment.name}
            />
          )}
          {(!isImage && !isPdf || !attachment.url) && (
            <div className="flex flex-col items-center justify-center gap-4">
              <p>Preview not available for this file type</p>
              {attachment.url && (
                <Button onClick={() => window.open(attachment.url, '_blank')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
