
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { AnnouncementAttachmentsList } from "@/components/communication/announcement/AnnouncementAttachmentsList";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AnnouncementsCardProps {
  announcements: any[];
  clickable?: boolean;
  viewAllUrl?: string;
}

export const AnnouncementsCard: React.FC<AnnouncementsCardProps> = ({ announcements, clickable = false, viewAllUrl }) => {
  const handleAttachmentAction = async (attachment: any, event: React.MouseEvent) => {
    // Stop event propagation to prevent card click handler from firing
    event.stopPropagation();
    
    try {
      console.log("Dashboard - handling attachment action:", attachment);
      
      if (attachment.url) {
        window.open(attachment.url, '_blank');
        return;
      }
      
      // List available files to debug
      const { data: files, error: listError } = await supabase
        .storage
        .from('announcements')
        .list();
      
      if (listError) {
        console.error('Error listing files:', listError);
      } else {
        console.log("Available files in storage:", files);
        console.log("Looking for file:", attachment.name);
      }
      
      // Get a signed URL from storage
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
      } else {
        toast({
          title: "Error",
          description: "No URL was returned for this attachment",
          variant: "destructive"
        });
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

  const handleButtonClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent parent click handlers from firing
    e.stopPropagation();
  };

  return (
    <Card className={clickable ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}>
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
                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <AnnouncementAttachmentsList 
                    attachments={announcement.attachments}
                    onAttachmentAction={(attachment) => (e) => handleAttachmentAction(attachment, e)}
                    compact={true}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
        
        {viewAllUrl && (
          <div className="text-center mt-4">
            <Link to={viewAllUrl} onClick={handleButtonClick}>
              <Button variant="link" size="sm">
                View All Announcements
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
