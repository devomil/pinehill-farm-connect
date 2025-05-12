
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAnnouncementStats } from "@/hooks/announcement/useAnnouncementStats";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AnnouncementStatsChart } from "@/components/dashboard/announcements/AnnouncementStatsChart";
import { AnnouncementStatsTable } from "@/components/dashboard/announcements/AnnouncementStatsTable";
import { AnnouncementStatsLoading } from "@/components/dashboard/announcements/AnnouncementStatsLoading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, BarChart } from "lucide-react";

interface AnnouncementStatsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AnnouncementStatsDialog: React.FC<AnnouncementStatsDialogProps> = ({
  open,
  onClose,
}) => {
  const { data: stats, isLoading, error } = useAnnouncementStats();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Announcement Statistics
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <AnnouncementStatsLoading />
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load announcement statistics</AlertDescription>
          </Alert>
        ) : stats && stats.length > 0 ? (
          <Tabs defaultValue="chart">
            <TabsList className="mb-4">
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="table">Detailed View</TabsTrigger>
            </TabsList>
            <TabsContent value="chart">
              <AnnouncementStatsChart data={stats} />
            </TabsContent>
            <TabsContent value="table">
              <AnnouncementStatsTable data={stats} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center p-6">
            <p className="text-muted-foreground">
              No announcement statistics available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
