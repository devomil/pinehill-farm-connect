
import React, { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { BarChart, Plus, RefreshCw } from "lucide-react";
import { AdminAnnouncementDialog } from "./AdminAnnouncementDialog";
import { User } from "@/types";
import { CommunicationDebugPanel } from "./CommunicationDebugPanel";
import { AnnouncementStatsDialog } from "./announcement/AnnouncementStatsDialog";
import { useAnnouncementStats } from "@/hooks/announcement/useAnnouncementStats";
import { convertAnnouncementStatToData } from "@/utils/announcementAdapters";

interface CommunicationHeaderProps {
  isAdmin: boolean;
  allEmployees: User[];
  onAnnouncementCreate: () => void;
  onManualRefresh: () => void;
  showDebugInfo: boolean;
  setShowDebugInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

// Use memo to prevent unnecessary re-renders of the entire header
export const CommunicationHeader = memo<CommunicationHeaderProps>(({
  isAdmin,
  allEmployees,
  onAnnouncementCreate,
  onManualRefresh,
  showDebugInfo,
  setShowDebugInfo,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  
  // Only fetch stats when stats dialog is opened to prevent unnecessary queries
  const { stats, isLoading, error, refetch } = useAnnouncementStats();

  // Use useCallback for all event handlers to prevent recreation on each render
  const handleNewAnnouncement = useCallback(() => {
    console.log("New announcement button clicked");
    setShowDialog(true);
  }, []);

  const handleViewStats = useCallback(() => {
    console.log("View stats button clicked");
    setShowStatsDialog(true);
    // Only refetch when dialog is opened
    refetch();
  }, [refetch]);

  const handleStatsDialogClose = useCallback(() => {
    setShowStatsDialog(false);
  }, []);

  // Memoize this conversion to prevent unnecessary recalculation
  const announcementData = React.useMemo(() => 
    stats ? convertAnnouncementStatToData(stats) : []
  , [stats]);

  // Memoize the refresh handler to avoid creating new function references
  const handleRefresh = useCallback(() => {
    console.log("Manual refresh button clicked");
    onManualRefresh();
  }, [onManualRefresh]);

  // Debug handler
  const toggleDebugInfo = useCallback(() => {
    console.log("Debug toggle clicked, current state:", !showDebugInfo);
    setShowDebugInfo(!showDebugInfo);
  }, [showDebugInfo, setShowDebugInfo]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Communication Center</h1>
          <p className="text-muted-foreground">
            View and manage company announcements and communications.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="h-9"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          
          {isAdmin && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleViewStats}
                className="h-9"
              >
                <BarChart className="h-4 w-4 mr-2" /> Stats
              </Button>
              
              <Button onClick={handleNewAnnouncement}>
                <Plus className="h-4 w-4 mr-2" /> New Announcement
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDebugInfo}
            className="h-9"
          >
            {showDebugInfo ? "Hide Debug" : "Show Debug"}
          </Button>
        </div>
      </div>

      {showDialog && (
        <AdminAnnouncementDialog
          allEmployees={allEmployees}
          onCreate={onAnnouncementCreate}
          open={showDialog}
          onClose={() => setShowDialog(false)}
        />
      )}

      {isAdmin && showStatsDialog && (
        <AnnouncementStatsDialog 
          open={showStatsDialog} 
          onClose={handleStatsDialogClose} 
          stats={announcementData}
          isLoading={isLoading}
          error={error}
          onRefresh={refetch}
        />
      )}
    </>
  );
});

// Add display name for debugging
CommunicationHeader.displayName = "CommunicationHeader";
