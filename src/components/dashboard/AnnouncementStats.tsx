
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Chart } from "lucide-react";
import { useAnnouncementStats } from "@/hooks/announcement/useAnnouncementStats";
import { AnnouncementStatsChart } from "./announcements/AnnouncementStatsChart";
import { AnnouncementStatsLoading } from "./announcements/AnnouncementStatsLoading";
import { UserList } from "./announcements/UserList";

interface AnnouncementStatsProps {
  clickable?: boolean;
}

export const AnnouncementStats: React.FC<AnnouncementStatsProps> = ({ clickable = false }) => {
  const { stats, loading } = useAnnouncementStats();

  return (
    <Card className={clickable ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Announcement Stats</CardTitle>
          <Chart className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>Read and acknowledgement stats</CardDescription>
      </CardHeader>
      <CardContent>
        {loading || !stats ? (
          <AnnouncementStatsLoading />
        ) : (
          <>
            <AnnouncementStatsChart
              readCount={stats.readCount}
              unreadCount={stats.unreadCount}
            />
            
            {stats.unreadUsers.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Employees who haven't read</h4>
                <UserList users={stats.unreadUsers.slice(0, 3)} total={stats.unreadUsers.length} />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
