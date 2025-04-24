import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Eye, Download, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AttachmentPreviewProps {
  attachment: { name: string; type: string; url?: string; size?: number };
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

  const handleDownload = async () => {
    setLoading(true);
    try {
      if (attachment.url) {
        const response = await fetch(attachment.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return;
      }

      const { data, error } = await supabase
        .storage
        .from('announcements')
        .download(`attachments/${attachment.name}`);

      if (error) {
        throw error;
      }

      if (data) {
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the file",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewClick = async () => {
    if (onAttachmentAction) {
      onAttachmentAction(attachment);
      return;
    }

    try {
      if (!attachment.url) {
        const { data, error } = await supabase
          .storage
          .from('announcements')
          .createSignedUrl(`attachments/${attachment.name}`, 3600);

        if (error) throw error;
        
        if (data) {
          window.open(data.signedUrl, '_blank');
          return;
        }
      }

      window.open(attachment.url, '_blank');
    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: "Preview failed",
        description: "Could not load the preview",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline"
        size="sm"
        onClick={handlePreviewClick}
        className={`${compact ? 'px-2' : ''}`}
      >
        <Eye className="h-4 w-4" />
        {!compact && <span className="ml-2">Preview</span>}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={loading}
        className={`${compact ? 'px-2' : ''}`}
      >
        <Download className="h-4 w-4" />
        {!compact && <span className="ml-2">Download</span>}
      </Button>
    </div>
  );
};
