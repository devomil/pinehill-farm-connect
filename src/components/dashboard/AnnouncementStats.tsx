
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnouncementStatsChart } from "./announcements/AnnouncementStatsChart";
import { AnnouncementStatsTable } from "./announcements/AnnouncementStatsTable";
import { AnnouncementUserDetails } from "./announcements/AnnouncementUserDetails";
import { AnnouncementStatsLoading } from "./announcements/AnnouncementStatsLoading";
import { useAnnouncementStats } from "@/hooks/announcement/useAnnouncementStats";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { convertAnnouncementStatToData } from "@/utils/announcementAdapters";

interface AnnouncementStatsProps {
  clickable?: boolean;
  viewAllUrl?: string;
}

export const AnnouncementStats: React.FC<AnnouncementStatsProps> = ({ clickable, viewAllUrl }) => {
  const { stats, isLoading, error, refetch } = useAnnouncementStats();
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);

  // Convert stats to expected format
  const statsData = stats ? convertAnnouncementStatToData(stats) : [];

  // Find the selected announcement
  const selectedAnnouncement = statsData?.find(
    announcement => announcement.id === selectedAnnouncementId
  ) || null;

  const handleRefresh = () => {
    refetch();
  };

  const handleViewDetails = (announcementId: string) => {
    setSelectedAnnouncementId(announcementId);
  };

  const handleBackToList = () => {
    setSelectedAnnouncementId(null);
  };

  if (isLoading) {
    return <AnnouncementStatsLoading />;
  }

  if (error) {
    return (
      <div className="rounded-md p-4 border border-red-200 bg-red-50">
        <h3 className="font-semibold mb-2">Failed to load announcement statistics</h3>
        <p className="text-sm text-red-700 mb-3">{error instanceof Error ? error.message : 'Unknown error'}</p>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <Card className={`w-full ${clickable ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        {!selectedAnnouncement ? (
          <>
            <div>
              <CardTitle>Announcement Performance</CardTitle>
              <CardDescription>
                Overview of read rates and engagement with announcements
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </>
        ) : (
          <>
            <div>
              <CardTitle>{selectedAnnouncement.title}</CardTitle>
              <CardDescription>
                {selectedAnnouncement.read_count} of {selectedAnnouncement.total_users} employees have read this announcement
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleBackToList}>
              Back to All Announcements
            </Button>
          </>
        )}
      </CardHeader>
      <CardContent>
        {!selectedAnnouncement ? (
          <>
            <div className="h-[350px] mb-8">
              {statsData && <AnnouncementStatsChart data={statsData} />}
            </div>
            {statsData && <AnnouncementStatsTable data={statsData} onViewDetails={handleViewDetails} />}
          </>
        ) : (
          <AnnouncementUserDetails users={selectedAnnouncement.users} />
        )}
      </CardContent>
      {!selectedAnnouncement && (
        <CardFooter className="text-sm text-muted-foreground">
          Click on "Details" to view which employees have read each announcement
        </CardFooter>
      )}
    </Card>
  );
};
