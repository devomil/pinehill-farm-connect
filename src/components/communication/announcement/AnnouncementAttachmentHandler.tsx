
import React from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAnnouncementAttachmentHandler = () => {
  const handleAttachmentAction = async (attachment: { name: string; type: string; url?: string; size?: number }) => {
    try {
      console.log("Handling attachment action:", attachment);
      
      // If URL is provided, use it directly
      if (attachment.url) {
        window.open(attachment.url, '_blank');
        return;
      }
      
      // Get a signed URL from Supabase storage
      const { data, error } = await supabase
        .storage
        .from('announcements')
        .createSignedUrl(`${attachment.name}`, 3600); // 1 hour expiry
      
      if (error) {
        console.error('Error creating signed URL:', error);
        toast({
          description: "Could not open attachment. There was an issue accessing the attachment",
          variant: "destructive"
        });
        return;
      }

      if (data?.signedUrl) {
        console.log("Opening signed URL:", data.signedUrl);
        window.open(data.signedUrl, '_blank');
      } else {
        toast({
          description: "Could not generate a URL for this attachment",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error handling attachment:', error);
      toast({
        description: "Could not open attachment. There was an issue accessing the attachment", 
        variant: "destructive"
      });
    }
  };

  return { handleAttachmentAction };
};
