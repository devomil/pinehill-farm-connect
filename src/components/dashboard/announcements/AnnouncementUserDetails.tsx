
import React from "react";
import { AnnouncementData } from "@/types/announcements";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserList } from "./UserList";

interface AnnouncementUserDetailsProps {
  users: AnnouncementData["users"];
}

export const AnnouncementUserDetails: React.FC<AnnouncementUserDetailsProps> = ({ users }) => {
  const readUsers = users.filter(user => user.read);
  const acknowledgedUsers = users.filter(user => user.acknowledged);
  const unreadUsers = users.filter(user => !user.read);
  const unacknowledgedUsers = users.filter(user => !user.acknowledged);
  
  const requiresAcknowledgment = acknowledgedUsers.length > 0 || unacknowledgedUsers.length > 0;

  return (
    <div className="p-4">
      <Tabs defaultValue="read">
        <TabsList>
          <TabsTrigger value="read">Read ({readUsers.length})</TabsTrigger>
          <TabsTrigger value="unread">Not Read ({unreadUsers.length})</TabsTrigger>
          {requiresAcknowledgment && (
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
        {requiresAcknowledgment && (
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
