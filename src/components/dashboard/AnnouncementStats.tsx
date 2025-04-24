
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface AnnouncementData {
  title: string;
  total_users: number;
  read_count: number;
  acknowledged_count: number;
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
            acknowledged_at
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
          : null
      })) as AnnouncementData[];
    }
  });

  if (isLoading) {
    return <StatsLoadingSkeleton />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <Card className="col-span-2">
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
                <TableHead className="text-right">Total Users</TableHead>
                <TableHead className="text-right">Read</TableHead>
                <TableHead className="text-right">Acknowledged</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.map((stat) => (
                <TableRow key={stat.title}>
                  <TableCell>{stat.title}</TableCell>
                  <TableCell className="text-right">{stat.total_users}</TableCell>
                  <TableCell className="text-right">
                    {stat.read_count} ({Math.round((stat.read_count / stat.total_users) * 100)}%)
                  </TableCell>
                  <TableCell className="text-right">
                    {stat.acknowledged_count !== null 
                      ? `${stat.acknowledged_count} (${Math.round((stat.acknowledged_count / stat.total_users) * 100)}%)`
                      : 'N/A'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const StatsLoadingSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
    <Card className="col-span-2">
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
  </div>
);
