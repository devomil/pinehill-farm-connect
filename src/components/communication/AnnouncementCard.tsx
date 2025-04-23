
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, FileText, Paperclip } from "lucide-react";
import { Announcement } from "@/types";
import { AnnouncementAttachmentPreview } from "./AnnouncementAttachmentPreview";

interface AnnouncementCardProps {
  announcement: Announcement;
  isRead: boolean;
  isAcknowledged?: boolean;
  onMarkAsRead?: () => void;
  onAcknowledge?: () => void;
  showMarkAsRead?: boolean;
  getPriorityBadge: (priority: string) => JSX.Element;
  isAdmin?: boolean;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  isRead,
  isAcknowledged,
  onMarkAsRead,
  onAcknowledge,
  showMarkAsRead,
  getPriorityBadge,
  isAdmin
}) => {
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
          {getPriorityBadge(announcement.priority)}
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
                  <Badge variant="outline" className="border-blue-200 text-blue-700">
                    <Paperclip className="h-3 w-3 mr-1" />
                    {attachment.name}
                  </Badge>
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
