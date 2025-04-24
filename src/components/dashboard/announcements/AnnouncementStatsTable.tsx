
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnnouncementData } from "@/types/announcements";
import { AvatarGroup } from "@/components/common/AvatarGroup";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnnouncementUserDetails } from "./AnnouncementUserDetails";

interface AnnouncementStatsTableProps {
  data: AnnouncementData[];
}

export const AnnouncementStatsTable = ({ data }: AnnouncementStatsTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (title: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <Table className="mt-6">
      <TableHeader>
        <TableRow>
          <TableHead className="w-8"></TableHead>
          <TableHead>Announcement</TableHead>
          <TableHead>Read By</TableHead>
          <TableHead>Acknowledged By</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((stat) => (
          <>
            <TableRow key={stat.title} className={expandedRows[stat.title] ? "border-b-0" : ""}>
              <TableCell className="p-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => toggleRow(stat.title)}
                  aria-label={expandedRows[stat.title] ? "Collapse row" : "Expand row"}
                >
                  {expandedRows[stat.title] ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </Button>
              </TableCell>
              <TableCell className="font-medium max-w-[200px] truncate">
                {stat.title}
              </TableCell>
              <TableCell>
                <AvatarGroup users={stat.users.filter(user => user.read)} showTooltip />
              </TableCell>
              <TableCell>
                <AvatarGroup users={stat.users.filter(user => user.acknowledged)} showTooltip />
              </TableCell>
            </TableRow>
            {expandedRows[stat.title] && (
              <TableRow className="bg-muted/30">
                <TableCell colSpan={4} className="p-0">
                  <AnnouncementUserDetails announcement={stat} />
                </TableCell>
              </TableRow>
            )}
          </>
        ))}
      </TableBody>
    </Table>
  );
};
