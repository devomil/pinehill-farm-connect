
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AvatarGroupProps {
  users: {
    id: string;
    name: string;
    avatar_url?: string;
    read_at?: string;
    acknowledged_at?: string;
  }[];
  showTooltip?: boolean;
  emptyText?: string;
}

export const AvatarGroup = ({ users, showTooltip = false, emptyText }: AvatarGroupProps) => {
  if (users.length === 0 && emptyText) {
    return <span className="text-sm text-muted-foreground">{emptyText}</span>;
  }

  return (
    <div className="flex -space-x-2 overflow-hidden">
      {users.slice(0, 5).map(user => (
        <TooltipProvider key={user.id} delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar 
                className="h-8 w-8 border-2 border-background ring-1 ring-border cursor-pointer"
              >
                {user.avatar_url ? (
                  <AvatarImage src={user.avatar_url} alt={user.name} />
                ) : (
                  <AvatarFallback>
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            </TooltipTrigger>
            {showTooltip && (
              <TooltipContent side="top" className="max-w-[200px]">
                <div className="text-sm font-medium">{user.name}</div>
                {user.read_at && (
                  <div className="text-xs text-muted-foreground">
                    Read: {new Date(user.read_at).toLocaleString()}
                  </div>
                )}
                {user.acknowledged_at && (
                  <div className="text-xs text-muted-foreground">
                    Acknowledged: {new Date(user.acknowledged_at).toLocaleString()}
                  </div>
                )}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
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
