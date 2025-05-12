
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnnouncementData } from "@/types/announcements";
import { formatDistanceToNow } from "date-fns";
import { Eye } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AnnouncementStatsTableProps {
  data: AnnouncementData[];
  onViewDetails: (id: string) => void;
}

export const AnnouncementStatsTable: React.FC<AnnouncementStatsTableProps> = ({ 
  data, 
  onViewDetails 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter and sort the data
  const filteredData = data
    .filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const handleViewDetails = (id: string) => {
    onViewDetails(id);
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search announcements..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="w-[100px]">Created</TableHead>
              <TableHead className="text-right w-[80px]">Read</TableHead>
              {data.some(item => item.requires_acknowledgment) && (
                <TableHead className="text-right w-[120px]">Acknowledged</TableHead>
              )}
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  {item.read_count}/{item.total_users}
                </TableCell>
                {data.some(a => a.requires_acknowledgment) && (
                  <TableCell className="text-right">
                    {item.requires_acknowledgment 
                      ? `${item.acknowledged_count || 0}/${item.total_users}` 
                      : "N/A"}
                  </TableCell>
                )}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(item.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={data.some(item => item.requires_acknowledgment) ? 5 : 4} className="h-24 text-center">
                  No announcements found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
