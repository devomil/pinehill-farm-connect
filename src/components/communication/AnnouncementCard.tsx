import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, FileText, Paperclip, Trash2, Edit } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Announcement } from "@/types";
import { AnnouncementAttachmentPreview } from "./AnnouncementAttachmentPreview";
import { useToast } from "@/hooks/use-toast";

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
  onDelete
}) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      onDelete(announcement.id);
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive"
      });
    }
  };

  const handleAttachmentAction = (attachment: { name: string; type: string; url?: string }) => {
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    } else {
      toast({
        title: "Error",
        description: "Attachment URL not available",
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
              {isRead && (
                <CheckCircle className="h-4 w-4 ml-2 text-green-600" />
              )}
            </CardTitle>
            <CardDescription>
              {announcement.createdAt.toLocaleDateString()} by {announcement.author}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getPriorityBadge(announcement.priority)}
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit?.(announcement)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this announcement? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Button variant="destructive" onClick={handleDelete}>
                        Delete
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm mb-4">{announcement.content}</p>
        
        {/* Attachments */}
        {announcement.attachments && announcement.attachments.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="text-sm font-medium">Attachments:</h4>
            <div className="flex flex-wrap gap-2">
              {announcement.attachments.map((attachment, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => handleAttachmentAction(attachment)}
                  >
                    <Paperclip className="h-3 w-3 mr-1" />
                    {attachment.name}
                  </Button>
                  <AnnouncementAttachmentPreview attachment={attachment} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acknowledgment Section */}
        {announcement.requires_acknowledgment && !isAdmin && (
          <div className="flex items-center gap-2 mt-4 p-2 bg-muted rounded">
            <Checkbox
              id={`ack-${announcement.id}`}
              checked={isAcknowledged}
              onCheckedChange={onAcknowledge}
              disabled={isAcknowledged}
            />
            <label htmlFor={`ack-${announcement.id}`} className="text-sm">
              I acknowledge that I have read and understood this announcement
            </label>
          </div>
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
