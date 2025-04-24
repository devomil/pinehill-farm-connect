
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
      const { data: announcements, error } = await supabase
        .from('announcements')
        .select(`
          id,
          title,
          requires_acknowledgment,
          announcement_recipients(
            read_at,
            acknowledged_at,
            profiles:user_id (
              id,
              name,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const { data: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      return announcements?.map(announcement => ({
        title: announcement.title,
        total_users: totalUsers?.length || 0,
        read_count: announcement.announcement_recipients.filter(r => r.read_at).length,
        acknowledged_count: announcement.requires_acknowledgment 
          ? announcement.announcement_recipients.filter(r => r.acknowledged_at).length 
          : null,
        users: announcement.announcement_recipients.map(recipient => ({
          id: recipient.profiles.id,
          name: recipient.profiles.name,
          avatar_url: recipient.profiles.avatar_url,
          read: !!recipient.read_at,
          acknowledged: !!recipient.acknowledged_at
        }))
      })) as AnnouncementData[];
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
          <BarChart data={stats}>
            <XAxis dataKey="title" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="read_count" name="Read" fill="var(--color-read)" />
            <Bar dataKey="acknowledged_count" name="Acknowledged" fill="var(--color-acknowledged)" />
            <Bar dataKey="total_users" name="Total Users" fill="var(--color-total)" />
          </BarChart>
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
