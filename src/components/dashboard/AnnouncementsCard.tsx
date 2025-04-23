
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MessageSquare, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnnouncementAttachmentPreview } from "@/components/communication/AnnouncementAttachmentPreview";
import { AnnouncementAttachmentsList } from "@/components/communication/announcement/AnnouncementAttachmentsList";
import { useToast } from "@/hooks/use-toast";

interface AnnouncementsCardProps {
  announcements: any[];
}

export const AnnouncementsCard: React.FC<AnnouncementsCardProps> = ({ announcements }) => {
  const { toast } = useToast();

  const handleAttachmentAction = (attachment: any) => {
    if (attachment.url) {
      try {
        window.open(attachment.url, '_blank');
      } catch (error) {
        console.error('Error opening attachment:', error);
        toast({
          title: "Failed to open attachment",
          description: "There was a problem opening this attachment. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Attachment URL not available",
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
              
              {/* Attachments Section */}
              {announcement.attachments && announcement.attachments.length > 0 && (
                <div className="mt-2">
                  <AnnouncementAttachmentsList 
                    attachments={announcement.attachments}
                    onAttachmentAction={handleAttachmentAction}
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
