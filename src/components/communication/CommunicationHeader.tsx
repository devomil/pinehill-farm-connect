
import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Heading } from "@/components/ui/heading";
import { AdminAnnouncementDialog } from "./AdminAnnouncementDialog";
import { AnnouncementStatsDialog } from "./announcement/AnnouncementStatsDialog";
import { RefreshCw, FilePlus, BarChartBig, Bug } from "lucide-react";
import { User } from "@/types";
import { useAnnouncementStats } from "@/hooks/announcement/useAnnouncementStats";
import { convertAnnouncementStatToData } from "@/utils/announcementAdapters";

interface CommunicationHeaderProps {
  isAdmin: boolean;
  allEmployees: User[];
  onAnnouncementCreate: () => void;
  onManualRefresh: () => void;
  showDebugInfo: boolean;
  setShowDebugInfo: (show: boolean) => void;
}

export const CommunicationHeader: React.FC<CommunicationHeaderProps> = ({
  isAdmin,
  allEmployees,
  onAnnouncementCreate,
  onManualRefresh,
  showDebugInfo,
  setShowDebugInfo,
}) => {
  const [announceDialogOpen, setAnnounceDialogOpen] = React.useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = React.useState(false);
  
  // Get announcement stats data
  const { stats, isLoading, error, refetch: refreshStats } = useAnnouncementStats();
  
  // Convert stats to AnnouncementData format using the adapter
  const convertedStats = stats ? convertAnnouncementStatToData(stats) : [];
  
  // Debug that the buttons are properly wired
  console.log("CommunicationHeader rendered with proper handlers:", {
    onManualRefresh: !!onManualRefresh,
    onAnnouncementCreate: !!onAnnouncementCreate
  });
  
  // Create stable handler functions with useCallback
  const handleRefreshClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Refresh button clicked");
    onManualRefresh();
  }, [onManualRefresh]);
  
  const handleCreateAnnouncementClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("New Announcement button clicked");
    setAnnounceDialogOpen(true);
  }, []);
  
  const toggleDebugInfo = useCallback(() => {
    setShowDebugInfo(!showDebugInfo);
  }, [showDebugInfo, setShowDebugInfo]);
  
  // Handle stats refresh
  const handleStatsRefresh = useCallback(() => {
    console.log("Refreshing announcement stats");
    refreshStats();
  }, [refreshStats]);
  
  return (
    <div className="flex justify-between items-center mb-6">
      <Heading title="Communication Center" />
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDebugInfo}
          title="Toggle debug panel"
        >
          <Bug className="h-4 w-4 mr-2" />
          Debug
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshClick}
          title="Refresh data"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        
        {isAdmin && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatsDialogOpen(true)}
            >
              <BarChartBig className="h-4 w-4 mr-2" />
              Stats
            </Button>
            
            <AnnouncementStatsDialog
              open={statsDialogOpen}
              onClose={() => setStatsDialogOpen(false)}
              stats={convertedStats}
              isLoading={isLoading}
              onRefresh={handleStatsRefresh}
              error={error}
            />
            
            <Button
              variant="default"
              onClick={handleCreateAnnouncementClick}
            >
              <FilePlus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
            
            <AdminAnnouncementDialog
              open={announceDialogOpen}
              onClose={() => setAnnounceDialogOpen(false)}
              allEmployees={allEmployees}
              onCreate={onAnnouncementCreate}
            />
          </>
        )}
      </div>
    </div>
  );
};
