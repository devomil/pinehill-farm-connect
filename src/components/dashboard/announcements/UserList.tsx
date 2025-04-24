
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface UserListProps {
  users: {
    id: string;
    name: string;
    avatar_url?: string;
    read_at?: string;
    acknowledged_at?: string;
  }[];
  timestampKey?: "read_at" | "acknowledged_at";
}

export const UserList = ({ users, timestampKey }: UserListProps) => {
  const sortedUsers = [...users].sort((a, b) => {
    // Sort by timestamp if available
    if (timestampKey) {
      const timeA = a[timestampKey] ? new Date(a[timestampKey]!).getTime() : 0;
      const timeB = b[timestampKey] ? new Date(b[timestampKey]!).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA; // Most recent first
    }
    
    // Fall back to sorting by name
    return a.name.localeCompare(b.name);
  });

  if (sortedUsers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground p-4">No users in this category.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedUsers.map(user => (
        <div key={user.id} className="flex items-center gap-3 p-3 rounded-md border">
          <Avatar className="h-10 w-10">
            {user.avatar_url ? (
              <AvatarImage src={user.avatar_url} alt={user.name} />
            ) : (
              <AvatarFallback>
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            {timestampKey && user[timestampKey] && (
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(user[timestampKey]!), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
