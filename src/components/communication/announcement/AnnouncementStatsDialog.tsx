
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AnnouncementData } from "@/types/announcements";
import { AnnouncementStatsTable } from "@/components/dashboard/announcements/AnnouncementStatsTable";
import { AnnouncementStatsChart } from "@/components/dashboard/announcements/AnnouncementStatsChart";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

interface AnnouncementStatsDialogProps {
  open: boolean;
  onClose: () => void;
  stats: AnnouncementData[] | null;
  isLoading: boolean;
  onRefresh: () => void;
  error: Error | null;
}

export const AnnouncementStatsDialog: React.FC<AnnouncementStatsDialogProps> = ({
  open,
  onClose,
  stats,
  isLoading,
  onRefresh,
  error,
}) => {
  // Dummy handler for view details since we're not implementing this in the dialog
  const handleViewDetails = (announcementId: string) => {
    console.log("View details for announcement:", announcementId);
    // In a dialog, we might want to show a nested dialog or change the content
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Announcement Statistics</span>
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </DialogTitle>
          <DialogDescription>
            Overview of read rates and engagement with announcements
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-red-800 font-medium">Failed to load statistics</h3>
            <p className="text-red-700 text-sm mt-1">{error.message}</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[250px] w-full" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : stats && stats.length > 0 ? (
          <>
            <div className="h-[300px] mb-8">
              <AnnouncementStatsChart data={stats} />
            </div>
            <AnnouncementStatsTable 
              data={stats} 
              onViewDetails={handleViewDetails}
            />
          </>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            No announcement statistics available.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
