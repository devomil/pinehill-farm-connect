
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
        // Get total user count
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

        if (announcementError) throw announcementError;

        // Process each announcement
        const processedAnnouncements = await Promise.all(announcements.map(async announcement => {
          // Get recipients for this announcement
          const { data: recipients } = await supabase
            .from('announcement_recipients')
            .select('read_at, acknowledged_at, user_id')
            .eq('announcement_id', announcement.id);

          // Get user profiles for these recipients
          const userIds = recipients?.map(r => r.user_id) || [];
          
          let userProfiles = [];
          if (userIds.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, name, avatar_url')
              .in('id', userIds);
            
            userProfiles = profiles || [];
          }

          // Map user data with read/acknowledged status
          const users = userProfiles.map(profile => {
            const recipient = recipients?.find(r => r.user_id === profile.id);
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
            read_count: recipients?.filter(r => r.read_at).length || 0,
            acknowledged_count: announcement.requires_acknowledgment 
              ? recipients?.filter(r => r.acknowledged_at).length || 0 
              : null,
            users
          };
        }));

        return processedAnnouncements;
      } catch (error) {
        console.error("Error fetching announcement stats:", error);
        throw error;
      }
    }
  });

  if (isLoading) {
    return <StatsLoadingSkeleton />;
  }

  if (!stats?.length) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Announcements Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            read: { label: "Read", theme: { light: "#0ea5e9", dark: "#38bdf8" } },
            acknowledged: { label: "Acknowledged", theme: { light: "#22c55e", dark: "#4ade80" } },
            total: { label: "Total Users", theme: { light: "#94a3b8", dark: "#64748b" } }
          }}
          className="h-[250px]"
        >
          <ResponsiveContainer>
            <BarChart data={stats} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <XAxis 
                dataKey="title" 
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="read_count" 
                name="Read" 
                fill="var(--color-read)"
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="acknowledged_count" 
                name="Acknowledged" 
                fill="var(--color-acknowledged)"
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="total_users" 
                name="Total Users" 
                fill="var(--color-total)"
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <Table className="mt-6">
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
                <TableCell className="font-medium max-w-[200px] truncate">
                  {stat.title}
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-2 overflow-hidden">
                    {stat.users
                      .filter(user => user.read)
                      .slice(0, 5)
                      .map(user => (
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
                    {stat.users.filter(user => user.read).length > 5 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted ring-1 ring-border">
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
                    {stat.users.filter(user => user.acknowledged).length > 5 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted ring-1 ring-border">
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
  <Card className="mt-4">
    <CardHeader>
      <CardTitle>Recent Announcements Statistics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[250px] mb-4">
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
