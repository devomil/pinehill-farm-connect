
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Eye, Download, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AttachmentPreviewProps {
  attachment: { name: string; type: string; url?: string };
  onAttachmentAction?: (attachment: { name: string; type: string; url?: string }) => void;
  compact?: boolean;
}

export const AnnouncementAttachmentPreview: React.FC<AttachmentPreviewProps> = ({ 
  attachment,
  onAttachmentAction,
  compact = false
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const isImage = attachment.type?.startsWith('image/');
  const isPdf = attachment.type === 'application/pdf';
  const isWord = attachment.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                attachment.type === 'application/msword';
  const isExcel = attachment.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                attachment.type === 'application/vnd.ms-excel';
  const isCsv = attachment.type === 'text/csv';

  const handleDownload = () => {
    if (onAttachmentAction) {
      onAttachmentAction(attachment);
      return;
    }
    
    if (!attachment.url) {
      toast({
        title: "Download failed",
        description: "The attachment URL is missing",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = attachment.url;
    link.target = '_blank';
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setLoading(false);
  };

  const handlePreviewClick = () => {
    if (!checkUrl()) return;
    
    setIsOpen(true);
    
    // If using the parent-provided attachment action
    if (onAttachmentAction && !attachment.url) {
      onAttachmentAction(attachment);
    }
  };

  const checkUrl = () => {
    if (onAttachmentAction) {
      return true;
    }
    
    if (!attachment.url) {
      toast({
        title: "Preview failed",
        description: "The attachment URL is missing",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-2 ${compact ? 'w-auto' : ''}`}
          onClick={handlePreviewClick}
          disabled={loading}
        >
          <Eye className="h-4 w-4" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogTitle>Preview: {attachment.name}</DialogTitle>
        <DialogDescription>Viewing attachment</DialogDescription>
        <div className="h-full overflow-auto p-4 mt-4 flex flex-col">
          {isImage && attachment.url && (
            <img 
              src={attachment.url} 
              alt={attachment.name}
              className="max-w-full h-auto mx-auto"
              onError={() => {
                toast({
                  title: "Image failed to load",
                  description: "The image might be unavailable or the URL is incorrect",
                  variant: "destructive"
                });
              }}
            />
          )}
          {isPdf && attachment.url && (
            <iframe
              src={`${attachment.url}#toolbar=0&navpanes=0`}
              className="w-full h-full border-0"
              title={attachment.name}
              sandbox="allow-scripts allow-same-origin allow-forms"
              onLoad={() => console.log("PDF loaded")}
              onError={() => {
                toast({
                  title: "PDF failed to load",
                  description: "The PDF might be unavailable or the URL is incorrect",
                  variant: "destructive"
                });
              }}
            />
          )}
          {(isWord || isExcel || isCsv || (!isImage && !isPdf) || !attachment.url) && (
            <div className="flex flex-col items-center justify-center gap-4 h-full">
              <File className="h-16 w-16 text-muted-foreground" />
              <p className="text-lg font-medium">Preview not available for {attachment.name}</p>
              <p className="text-muted-foreground mb-4">This file type cannot be previewed directly in the browser.</p>
              <Button 
                onClick={handleDownload} 
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
