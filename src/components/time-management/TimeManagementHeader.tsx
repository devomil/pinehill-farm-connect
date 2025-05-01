
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { TimeOffRequestForm } from "@/components/time-management/TimeOffRequestForm";
import { User } from "@/types";

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
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Time Management</h1>
        <p className="text-muted-foreground">Request and manage time off</p>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onRefresh} 
          title="Refresh data"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <TimeOffRequestForm
          currentUser={currentUser}
          onRequestSubmitted={onRequestSubmitted}
        />
      </div>
    </div>
  );
};
