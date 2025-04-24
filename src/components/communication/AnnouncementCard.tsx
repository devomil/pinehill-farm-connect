import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText } from "lucide-react";
import { Announcement } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { AnnouncementActions } from "./announcement/AnnouncementActions";
import { AnnouncementAttachmentsList } from "./announcement/AnnouncementAttachmentsList";
import { AnnouncementAcknowledgment } from "./announcement/AnnouncementAcknowledgment";

interface AnnouncementCardProps {
  announcement: Announcement;
  isRead: boolean;
  isAcknowledged?: boolean;
  onMarkAsRead?: () => void;
  onAcknowledge?: () => void;
  showMarkAsRead?: boolean;
  getPriorityBadge: (priority: string) => JSX.Element;
  isAdmin?: boolean;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (id: string) => void;
  onAttachmentAction?: (attachment: { name: string; type: string; url?: string }) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  isRead,
  isAcknowledged,
  onMarkAsRead,
  onAcknowledge,
  showMarkAsRead,
  getPriorityBadge,
  isAdmin,
  onEdit,
  onDelete,
  onAttachmentAction,
}) => {
  const { toast } = useToast();

  const handleAttachmentAction = (attachment: { name: string; type: string; url?: string }) => {
    if (onAttachmentAction) {
      onAttachmentAction(attachment);
    } else if (attachment.url) {
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

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      onDelete(announcement.id);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive"
      });
    }
  };

  return (
    <Card
      className={`transition-colors ${
        isRead
          ? "bg-muted/30"
          : announcement.priority === "urgent"
          ? "bg-red-50"
          : "bg-white"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center">
              {announcement.title}
              {isRead && <CheckCircle className="h-4 w-4 ml-2 text-green-600" />}
            </CardTitle>
            <CardDescription>
              {announcement.createdAt.toLocaleDateString()} by {announcement.author}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getPriorityBadge(announcement.priority)}
            {isAdmin && onEdit && onDelete && (
              <AnnouncementActions
                announcement={announcement}
                onEdit={() => onEdit(announcement)}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm mb-4">{announcement.content}</p>
        
        {announcement.attachments && announcement.attachments.length > 0 && (
          <AnnouncementAttachmentsList
            attachments={announcement.attachments}
            onAttachmentAction={handleAttachmentAction}
          />
        )}

        {announcement.requires_acknowledgment && !isAdmin && (
          <AnnouncementAcknowledgment
            id={announcement.id}
            isAcknowledged={isAcknowledged}
            onAcknowledge={onAcknowledge}
          />
        )}

        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            {announcement.hasQuiz && (
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                <FileText className="h-3 w-3 mr-1" />
                Has Quiz
              </Badge>
            )}
          </div>
          {showMarkAsRead && !isRead && onMarkAsRead && (
            <Button size="sm" variant="secondary" onClick={onMarkAsRead}>
              Mark as Read
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
