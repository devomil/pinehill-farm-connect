
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Eye, Download, File } from "lucide-react";

interface AttachmentPreviewProps {
  attachment: { name: string; type: string; url?: string };
}

export const AnnouncementAttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachment }) => {
  const isImage = attachment.type?.startsWith('image/');
  const isPdf = attachment.type === 'application/pdf';
  const isWord = attachment.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                attachment.type === 'application/msword';
  const isExcel = attachment.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                attachment.type === 'application/vnd.ms-excel';
  const isCsv = attachment.type === 'text/csv';

  const handleDownload = () => {
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogTitle>Preview: {attachment.name}</DialogTitle>
        <DialogDescription>Viewing attachment</DialogDescription>
        <div className="h-full overflow-auto p-4 mt-4">
          {isImage && attachment.url && (
            <img 
              src={attachment.url} 
              alt={attachment.name}
              className="max-w-full h-auto"
            />
          )}
          {isPdf && attachment.url && (
            <iframe
              src={`${attachment.url}#toolbar=0&navpanes=0`}
              className="w-full h-full border-0"
              title={attachment.name}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
            />
          )}
          {(isWord || isExcel || isCsv || (!isImage && !isPdf) || !attachment.url) && (
            <div className="flex flex-col items-center justify-center gap-4 h-full">
              <File className="h-16 w-16 text-muted-foreground" />
              <p className="text-lg font-medium">Preview not available for {attachment.name}</p>
              <p className="text-muted-foreground mb-4">This file type cannot be previewed directly in the browser.</p>
              {attachment.url && (
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
