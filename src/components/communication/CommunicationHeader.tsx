
import React, { useState } from "react";
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

export const CommunicationHeader: React.FC<CommunicationHeaderProps> = ({
  isAdmin,
  allEmployees,
  onAnnouncementCreate,
  onManualRefresh,
  showDebugInfo,
  setShowDebugInfo,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const { data: stats, isLoading, error, refetch } = useAnnouncementStats();

  const handleNewAnnouncement = () => {
    setShowDialog(true);
  };

  const handleViewStats = () => {
    setShowStatsDialog(true);
  };

  const handleStatsDialogClose = () => {
    setShowStatsDialog(false);
  };

  // Convert stats to AnnouncementData format
  const announcementData = stats ? convertAnnouncementStatToData(stats) : [];

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
          <Button variant="outline" size="sm" onClick={onManualRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          
          {isAdmin && (
            <>
              <Button variant="outline" size="sm" onClick={handleViewStats}>
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
            onClick={() => setShowDebugInfo(!showDebugInfo)}
          >
            {showDebugInfo ? "Hide Debug" : "Show Debug"}
          </Button>
        </div>
      </div>

      <AdminAnnouncementDialog
        allEmployees={allEmployees}
        onCreate={onAnnouncementCreate}
        open={showDialog}
        onClose={() => setShowDialog(false)}
      />

      {isAdmin && (
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
};
