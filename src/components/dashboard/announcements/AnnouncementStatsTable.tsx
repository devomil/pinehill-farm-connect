
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AnnouncementStatsTableProps {
  data: any[];
}

export const AnnouncementStatsTable: React.FC<AnnouncementStatsTableProps> = ({ data }) => {
  // Sort data by created_at date (newest first)
  const sortedData = [...data].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'important':
        return <Badge variant="default">Important</Badge>;
      default:
        return <Badge variant="outline">FYI</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="text-right">Read</TableHead>
            <TableHead className="text-right">Recipients</TableHead>
            <TableHead className="text-right">Read %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>
                {new Date(item.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {getPriorityBadge(item.priority)}
              </TableCell>
              <TableCell className="text-right">{item.readCount}</TableCell>
              <TableCell className="text-right">{item.totalRecipients}</TableCell>
              <TableCell className="text-right">
                <Badge variant={item.readPercentage > 80 ? "success" : 
                  item.readPercentage > 50 ? "default" : "outline"}>
                  {item.readPercentage}%
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
