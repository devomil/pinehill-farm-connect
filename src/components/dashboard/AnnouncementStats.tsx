
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnnouncementStats } from "@/hooks/announcement/useAnnouncementStats";
import { AnnouncementStatsChart } from "./announcements/AnnouncementStatsChart";
import { AnnouncementStatsTable } from "./announcements/AnnouncementStatsTable";
import { AnnouncementStatsLoading } from "./announcements/AnnouncementStatsLoading";

export const AnnouncementStats = () => {
  const { data: stats, isLoading } = useAnnouncementStats();

  if (isLoading) {
    return <AnnouncementStatsLoading />;
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
        <AnnouncementStatsChart data={stats} />
        <AnnouncementStatsTable data={stats} />
      </CardContent>
    </Card>
  );
};
