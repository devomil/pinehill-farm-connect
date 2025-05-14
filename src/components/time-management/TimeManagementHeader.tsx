
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { User } from "@/types";
import { NewRequestDialog } from "./NewRequestDialog";
import { useTimeManagement } from "@/contexts/timeManagement";
import { toast } from "sonner";

interface TimeManagementHeaderProps {
  currentUser: User;
  onRefresh: () => void;
  onRequestSubmitted: () => void;
}

export const TimeManagementHeader: React.FC<TimeManagementHeaderProps> = ({ 
  currentUser,
  onRefresh,
  onRequestSubmitted
}) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { allEmployees } = useTimeManagement();

  const handleNewRequest = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleRequestSubmitted = () => {
    setDialogOpen(false);
    onRequestSubmitted();
    toast({
      description: "Request submitted successfully",
      variant: "success"
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Time Management</h1>
          <p className="text-muted-foreground">Request and manage time off</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh data">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleNewRequest}>
            <Plus className="h-4 w-4 mr-1" /> New Request
          </Button>
        </div>
      </div>

      <NewRequestDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleRequestSubmitted}
        currentUser={currentUser}
        allEmployees={allEmployees}
      />
    </div>
  );
};
