
import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Heading } from "@/components/ui/heading";
import { AdminAnnouncementDialog } from "./AdminAnnouncementDialog";
import { AnnouncementStatsDialog } from "./announcement/AnnouncementStatsDialog";
import { RefreshCw, FilePlus, BarChartBig, Bug } from "lucide-react";
import { User } from "@/types";
import { useAnnouncementStats } from "@/hooks/announcement/useAnnouncementStats";
import { convertAnnouncementStatsToData, convertHookStatsToIndexFormat } from "@/utils/announcementAdapters";
import { useDebug } from "@/hooks/useDebug";
import { DebugButton } from "@/components/debug/DebugButton";

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
  
  // Use our new debug hook
  const debug = useDebug('communication.header', { 
    logProps: true, 
    traceLifecycle: true 
  });
  
  // Get announcement stats data
  const { stats, isLoading, error, refetch: refreshStats } = useAnnouncementStats();
  
  // Convert stats to AnnouncementData format using the adapter
  const adaptedStats = stats ? convertHookStatsToIndexFormat(stats) : [];
  const convertedStats = convertAnnouncementStatsToData(adaptedStats);
  
  // Debug button props and handlers
  debug.debug("Rendering with props", {
    isAdmin,
    employeeCount: allEmployees?.length,
    showDebugInfo,
    hasRefreshHandler: !!onManualRefresh,
    hasCreateHandler: !!onAnnouncementCreate
  });
  
  // Create stable handler functions with useCallback
  const handleRefreshClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    debug.info("Refresh button clicked");
    onManualRefresh();
  }, [onManualRefresh, debug]);
  
  const handleCreateAnnouncementClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    debug.info("New Announcement button clicked");
    setAnnounceDialogOpen(true);
  }, [debug]);
  
  const toggleDebugInfo = useCallback(() => {
    debug.info(`Toggling debug info: ${!showDebugInfo}`);
    setShowDebugInfo(!showDebugInfo);
  }, [showDebugInfo, setShowDebugInfo, debug]);
  
  // Handle stats refresh
  const handleStatsRefresh = useCallback(() => {
    debug.info("Refreshing announcement stats");
    refreshStats();
  }, [refreshStats, debug]);
  
  return (
    <div className="flex justify-between items-center mb-6">
      <Heading title="Communication Center" />
      
      <div className="flex items-center space-x-2">
        {/* Use our new DebugButton component */}
        <DebugButton />
        
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDebugInfo}
          title="Toggle component debug info"
        >
          <Bug className="h-4 w-4 mr-2" />
          Component Debug
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshClick}
          title="Refresh data"
          id="communication-refresh-button" // Add ID for easier debugging
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
              id="stats-button"
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
              id="new-announcement-button"
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
