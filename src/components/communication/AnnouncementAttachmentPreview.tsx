
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
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

      // If no URL provided, get from Supabase storage
      // Note: Fixed path here - using just the name instead of attachments/name
      const { data, error } = await supabase
        .storage
        .from('announcements')
        .download(`${attachment.name}`);

      if (error) {
        console.error("Download error:", error);
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
    try {
      if (onAttachmentAction) {
        onAttachmentAction(attachment);
        return;
      }
      
      if (!attachment.url) {
        // If no URL provided, get a signed URL from Supabase
        // Note: Fixed path here - using just the name instead of attachments/name
        const { data, error } = await supabase
          .storage
          .from('announcements')
          .createSignedUrl(`${attachment.name}`, 3600);

        if (error) {
          console.error("Preview error:", error);
          throw error;
        }
        
        if (data?.signedUrl) {
          window.open(data.signedUrl, '_blank');
          return;
        }
      } else {
        // Use the provided URL
        window.open(attachment.url, '_blank');
      }
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
