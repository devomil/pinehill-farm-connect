
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AnnouncementData {
  title: string;
  total_users: number;
  read_count: number;
  acknowledged_count: number;
  users: {
    id: string;
    name: string;
    avatar_url?: string;
    read: boolean;
    acknowledged: boolean;
  }[];
}

export const AnnouncementStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['announcement-stats'],
    queryFn: async () => {
      try {
        // Get total user count first
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        // Fetch announcements with basic data
        const { data: announcements, error: announcementError } = await supabase
          .from('announcements')
          .select(`
            id,
            title,
            requires_acknowledgment
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (announcementError) {
          console.error("Error fetching announcements:", announcementError);
          throw announcementError;
        }
        
        // Process each announcement to get user data separately
        const processedAnnouncements = await Promise.all(announcements.map(async announcement => {
          // Get recipients for this announcement
          const { data: recipients, error: recipientsError } = await supabase
            .from('announcement_recipients')
            .select(`
              read_at,
              acknowledged_at,
              user_id
            `)
            .eq('announcement_id', announcement.id);
            
          if (recipientsError) {
            console.error(`Error fetching recipients for announcement ${announcement.id}:`, recipientsError);
            throw recipientsError;
          }
          
          // Fetch user profiles for these recipients
          const userIds = recipients.map(r => r.user_id);
          
          // Only fetch profiles if there are recipients
          let userProfiles = [];
          if (userIds.length > 0) {
            const { data: profiles, error: profilesError } = await supabase
              .from('profiles')
              .select('id, name, avatar_url')
              .in('id', userIds);
              
            if (profilesError) {
              console.error("Error fetching user profiles:", profilesError);
              throw profilesError;
            }
            
            userProfiles = profiles || [];
          }
          
          // Map user data with read/acknowledged status
          const users = userProfiles.map(profile => {
            const recipient = recipients.find(r => r.user_id === profile.id);
            return {
              id: profile.id,
              name: profile.name || 'Unknown User',
              avatar_url: profile.avatar_url,
              read: recipient ? !!recipient.read_at : false,
              acknowledged: recipient ? !!recipient.acknowledged_at : false
            };
          });
          
          return {
            title: announcement.title,
            total_users: totalUsers || 0,
            read_count: recipients.filter(r => r.read_at).length,
            acknowledged_count: announcement.requires_acknowledgment 
              ? recipients.filter(r => r.acknowledged_at).length 
              : null,
            users
          };
        }));
        
        return processedAnnouncements as AnnouncementData[];
      } catch (error) {
        console.error("Error fetching announcement stats:", error);
        throw error;
      }
    }
  });

  if (isLoading) {
    return <StatsLoadingSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Announcements Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            read: { label: "Read", theme: { light: "#0ea5e9", dark: "#38bdf8" } },
            acknowledged: { label: "Acknowledged", theme: { light: "#22c55e", dark: "#4ade80" } },
            total: { label: "Total Users", theme: { light: "#94a3b8", dark: "#64748b" } }
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer>
            <BarChart data={stats}>
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="read_count" name="Read" fill="var(--color-read)" />
              <Bar dataKey="acknowledged_count" name="Acknowledged" fill="var(--color-acknowledged)" />
              <Bar dataKey="total_users" name="Total Users" fill="var(--color-total)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Announcement</TableHead>
              <TableHead>Read By</TableHead>
              <TableHead>Acknowledged By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats?.map((stat) => (
              <TableRow key={stat.title}>
                <TableCell className="font-medium">{stat.title}</TableCell>
                <TableCell>
                  <div className="flex -space-x-2 overflow-hidden">
                    {stat.users
                      .filter(user => user.read)
                      .slice(0, 5)
                      .map(user => (
                        <Avatar key={user.id} className="h-8 w-8 border-2 border-background">
                          {user.avatar_url ? (
                            <AvatarImage src={user.avatar_url} alt={user.name} />
                          ) : (
                            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          )}
                        </Avatar>
                      ))}
                    {stat.users.filter(user => user.read).length > 5 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted">
                        <span className="text-xs font-medium">
                          +{stat.users.filter(user => user.read).length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-2 overflow-hidden">
                    {stat.users
                      .filter(user => user.acknowledged)
                      .slice(0, 5)
                      .map(user => (
                        <Avatar key={user.id} className="h-8 w-8 border-2 border-background">
                          {user.avatar_url ? (
                            <AvatarImage src={user.avatar_url} alt={user.name} />
                          ) : (
                            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          )}
                        </Avatar>
                      ))}
                    {stat.users.filter(user => user.acknowledged).length > 5 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted">
                        <span className="text-xs font-medium">
                          +{stat.users.filter(user => user.acknowledged).length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const StatsLoadingSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Announcements Statistics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[300px] mb-4">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="w-full h-12" />
        ))}
      </div>
    </CardContent>
  </Card>
);
