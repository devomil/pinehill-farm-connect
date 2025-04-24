
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnnouncementData } from "@/types/announcements";

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

interface AvatarGroupProps {
  users: AnnouncementData['users'];
}

const AvatarGroup = ({ users }: AvatarGroupProps) => {
  return (
    <div className="flex -space-x-2 overflow-hidden">
      {users.slice(0, 5).map(user => (
        <Avatar 
          key={user.id} 
          className="h-8 w-8 border-2 border-background ring-1 ring-border"
        >
          {user.avatar_url ? (
            <AvatarImage src={user.avatar_url} alt={user.name} />
          ) : (
            <AvatarFallback>
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      ))}
      {users.length > 5 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted ring-1 ring-border">
          <span className="text-xs font-medium">
            +{users.length - 5}
          </span>
        </div>
      )}
    </div>
  );
};
