
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface AnnouncementsCardProps {
  announcements: any[];
}

export const AnnouncementsCard: React.FC<AnnouncementsCardProps> = ({ announcements }) => {
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
            <li key={announcement.id} className="flex justify-between items-center">
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
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
