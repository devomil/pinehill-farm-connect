
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react"; // Changed from Chart to BarChart3
import { useAnnouncementStats } from "@/hooks/announcement/useAnnouncementStats";
import { AnnouncementStatsChart } from "./announcements/AnnouncementStatsChart";
import { AnnouncementStatsLoading } from "./announcements/AnnouncementStatsLoading";
import { UserList } from "./announcements/UserList";

interface AnnouncementStatsProps {
  clickable?: boolean;
}

export const AnnouncementStats: React.FC<AnnouncementStatsProps> = ({ clickable = false }) => {
  const { data: stats, isLoading, error } = useAnnouncementStats(); // Changed to use data, isLoading from React Query

  return (
    <Card className={clickable ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Announcement Stats</CardTitle>
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>Read and acknowledgement stats</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !stats ? (
          <AnnouncementStatsLoading />
        ) : (
          <>
            <AnnouncementStatsChart
              data={stats} // Pass the entire data object
            />
            
            {stats.length > 0 && stats[0].users.filter(u => !u.read).length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Employees who haven't read</h4>
                <UserList 
                  users={stats[0].users.filter(u => !u.read).slice(0, 3)} 
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
