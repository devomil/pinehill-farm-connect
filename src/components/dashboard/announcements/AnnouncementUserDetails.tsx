
import { AnnouncementData } from "@/types/announcements";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserList } from "./UserList";

interface AnnouncementUserDetailsProps {
  announcement: AnnouncementData;
}

export const AnnouncementUserDetails = ({ announcement }: AnnouncementUserDetailsProps) => {
  const readUsers = announcement.users.filter(user => user.read);
  const acknowledgedUsers = announcement.users.filter(user => user.acknowledged);
  const unreadUsers = announcement.users.filter(user => !user.read);
  const unacknowledgedUsers = announcement.requires_acknowledgment 
    ? announcement.users.filter(user => !user.acknowledged) 
    : [];

  return (
    <div className="p-4">
      <Tabs defaultValue="read">
        <TabsList>
          <TabsTrigger value="read">Read ({readUsers.length})</TabsTrigger>
          <TabsTrigger value="unread">Not Read ({unreadUsers.length})</TabsTrigger>
          {announcement.requires_acknowledgment && (
            <>
              <TabsTrigger value="acknowledged">Acknowledged ({acknowledgedUsers.length})</TabsTrigger>
              <TabsTrigger value="unacknowledged">Not Acknowledged ({unacknowledgedUsers.length})</TabsTrigger>
            </>
          )}
        </TabsList>
        <TabsContent value="read" className="mt-4">
          {readUsers.length > 0 ? (
            <UserList users={readUsers} timestampKey="read_at" />
          ) : (
            <p className="text-sm text-muted-foreground">No users have read this announcement yet.</p>
          )}
        </TabsContent>
        <TabsContent value="unread" className="mt-4">
          {unreadUsers.length > 0 ? (
            <UserList users={unreadUsers} />
          ) : (
            <p className="text-sm text-muted-foreground">All users have read this announcement.</p>
          )}
        </TabsContent>
        {announcement.requires_acknowledgment && (
          <>
            <TabsContent value="acknowledged" className="mt-4">
              {acknowledgedUsers.length > 0 ? (
                <UserList users={acknowledgedUsers} timestampKey="acknowledged_at" />
              ) : (
                <p className="text-sm text-muted-foreground">No users have acknowledged this announcement yet.</p>
              )}
            </TabsContent>
            <TabsContent value="unacknowledged" className="mt-4">
              {unacknowledgedUsers.length > 0 ? (
                <UserList users={unacknowledgedUsers} />
              ) : (
                <p className="text-sm text-muted-foreground">All users have acknowledged this announcement.</p>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};
