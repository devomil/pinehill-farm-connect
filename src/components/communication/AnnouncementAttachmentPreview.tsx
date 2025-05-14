
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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
  const [loading, setLoading] = useState(false);
  
  const handleDownload = async () => {
    setLoading(true);
    console.log("Download requested for:", attachment);
    
    try {
      // If onAttachmentAction is provided, use it for consistent handling
      if (onAttachmentAction) {
        // We'll still handle the actual download here
        let fileUrl = attachment.url;
        
        // If no URL provided, get from Supabase storage
        if (!fileUrl) {
          console.log("Requesting signed URL for download:", attachment.name);
          const { data, error } = await supabase
            .storage
            .from('announcements')
            .createSignedUrl(`${attachment.name}`, 3600);

          if (error) {
            console.error("Download error:", error);
            throw error;
          }
          
          if (data?.signedUrl) {
            fileUrl = data.signedUrl;
          } else {
            throw new Error("Could not generate download URL");
          }
        }
        
        // Use the URL to trigger a download
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback if no action handler provided
        // If no URL provided, get from Supabase storage
        if (!attachment.url) {
          console.log("Requesting file from storage for download:", attachment.name);
          const { data, error } = await supabase
            .storage
            .from('announcements')
            .download(`${attachment.name}`);

          if (error) {
            console.error("Direct download error:", error);
            throw error;
          }

          if (data) {
            console.log("File downloaded successfully, creating object URL");
            const url = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.download = attachment.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }
        } else {
          // Direct download from provided URL
          window.open(attachment.url, '_blank');
        }
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
    console.log("Preview clicked for:", attachment);
    setLoading(true);
    
    try {
      // If an action handler is provided, use that for consistent handling
      if (onAttachmentAction) {
        console.log("Using provided action handler for preview");
        onAttachmentAction(attachment);
      } else {
        // Fallback if no action handler provided
        let previewUrl = attachment.url;
        
        // If no URL provided, get a signed URL from Supabase
        if (!previewUrl) {
          console.log("Requesting signed URL for preview:", attachment.name);
          const { data, error } = await supabase
            .storage
            .from('announcements')
            .createSignedUrl(`${attachment.name}`, 3600);

          if (error) {
            console.error("Preview error:", error);
            throw error;
          }
          
          if (data?.signedUrl) {
            previewUrl = data.signedUrl;
          } else {
            throw new Error("Could not generate preview URL");
          }
        }
        
        // Open the preview URL in a new tab
        window.open(previewUrl, '_blank');
      }
    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: "Preview failed",
        description: "Could not load the preview",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline"
        size="sm"
        onClick={handlePreviewClick}
        className={`${compact ? 'px-2' : ''}`}
        disabled={loading}
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
