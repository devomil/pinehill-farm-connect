
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnnouncementData } from "@/types/announcements";
import { AvatarGroup } from "@/components/common/AvatarGroup";

interface AnnouncementStatsTableProps {
  data: AnnouncementData[];
}

export const AnnouncementStatsTable = ({ data }: AnnouncementStatsTableProps) => {
  return (
    <Table className="mt-6">
      <TableHeader>
        <TableRow>
          <TableHead>Announcement</TableHead>
          <TableHead>Read By</TableHead>
          <TableHead>Acknowledged By</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((stat) => (
          <TableRow key={stat.title}>
            <TableCell className="font-medium max-w-[200px] truncate">
              {stat.title}
            </TableCell>
            <TableCell>
              <AvatarGroup users={stat.users.filter(user => user.read)} />
            </TableCell>
            <TableCell>
              <AvatarGroup users={stat.users.filter(user => user.acknowledged)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
