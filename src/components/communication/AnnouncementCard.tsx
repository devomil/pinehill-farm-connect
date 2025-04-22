
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Paperclip } from "lucide-react";
import { Announcement } from "@/types";

interface AnnouncementCardProps {
  announcement: Announcement;
  isRead: boolean;
  onMarkAsRead?: () => void;
  showMarkAsRead?: boolean;
  getPriorityBadge: (priority: string) => JSX.Element;
}
export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  isRead,
  onMarkAsRead,
  showMarkAsRead,
  getPriorityBadge,
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
        <div className="flex flex-wrap gap-1 mb-3">
          {announcement.hasQuiz && (
            <Badge variant="outline" className="border-blue-200 text-blue-700">
              <FileText className="h-3 w-3 mr-1" />
              Has Quiz
            </Badge>
          )}
          {announcement.attachments?.length > 0 && (
            <Badge variant="outline" className="border-blue-200 text-blue-700">
              <Paperclip className="h-3 w-3 mr-1" />
              {announcement.attachments.length} attachment{announcement.attachments.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div />
          {showMarkAsRead && !isRead && onMarkAsRead && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onMarkAsRead}
            >
              Mark as Read
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

