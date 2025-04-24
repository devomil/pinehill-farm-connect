
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { AnnouncementAttachmentsList } from "@/components/communication/announcement/AnnouncementAttachmentsList";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnnouncementsCardProps {
  announcements: any[];
}

export const AnnouncementsCard: React.FC<AnnouncementsCardProps> = ({ announcements }) => {
  const { toast } = useToast();

  const handleAttachmentAction = async (attachment: any) => {
    try {
      if (attachment.url) {
        window.open(attachment.url, '_blank');
        return;
      }
      
      // Note: Fixed path here - using just the name instead of attachments/name
      const { data, error } = await supabase
        .storage
        .from('announcements')
        .createSignedUrl(`${attachment.name}`, 3600);
      
      if (error) {
        console.error('Error creating signed URL:', error);
        toast({
          title: "Failed to open attachment",
          description: "Could not retrieve the attachment URL. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      if (data) {
        console.log("Got signed URL:", data.signedUrl);
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error handling attachment:', error);
      toast({
        title: "Failed to open attachment",
        description: "There was a problem opening this attachment. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Announcements</CardTitle>
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>Latest company updates</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {announcements.map((announcement) => (
            <li key={announcement.id} className="flex flex-col">
              <div className="flex justify-between items-center">
                <div>
                  <p>{announcement.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span 
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                    ${announcement.priority === "urgent" 
                      ? "bg-red-100 text-red-800" 
                      : announcement.priority === "important" 
                        ? "bg-amber-100 text-amber-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}
                >
                  {announcement.priority}
                </span>
              </div>
              
              {announcement.attachments && announcement.attachments.length > 0 && (
                <div className="mt-2">
                  <AnnouncementAttachmentsList 
                    attachments={announcement.attachments}
                    onAttachmentAction={handleAttachmentAction}
                    compact={true}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
