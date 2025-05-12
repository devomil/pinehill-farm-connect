
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { AnnouncementData } from "@/types/announcements";

interface AnnouncementStatsTableProps {
  announcements: AnnouncementData[];
  onViewDetails: (announcementId: string) => void;
}

export const AnnouncementStatsTable: React.FC<AnnouncementStatsTableProps> = ({
  announcements,
  onViewDetails,
}) => {
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    let valA, valB;

    switch (sortField) {
      case "title":
        valA = a.title;
        valB = b.title;
        break;
      case "read_count":
        valA = a.read_count;
        valB = b.read_count;
        break;
      default:
        // Default to sorting by created_at
        valA = new Date(a.created_at || "").getTime();
        valB = new Date(b.created_at || "").getTime();
    }

    if (valA === valB) return 0;
    const result = valA > valB ? 1 : -1;
    return sortDirection === "asc" ? result : -result;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer" 
              onClick={() => handleSort("title")}
            >
              Title {sortField === "title" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Time</TableHead>
            <TableHead 
              className="cursor-pointer" 
              onClick={() => handleSort("read_count")}
            >
              Read {sortField === "read_count" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAnnouncements.map((announcement) => (
            <TableRow key={announcement.title}>
              <TableCell className="font-medium">{announcement.title}</TableCell>
              <TableCell>
                <Badge 
                  variant={
                    announcement.requires_acknowledgment 
                      ? "outline" 
                      : "default"
                  }
                >
                  {announcement.requires_acknowledgment ? "Ack Required" : "Standard"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {announcement.created_at &&
                  formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                {announcement.read_count}/{announcement.total_users} 
                <span className="text-muted-foreground ml-1">
                  ({Math.round((announcement.read_count / announcement.total_users) * 100)}%)
                </span>
              </TableCell>
              <TableCell>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onViewDetails(announcement.title)}
                >
                  Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
