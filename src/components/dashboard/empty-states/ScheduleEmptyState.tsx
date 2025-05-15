
import React from "react";
import { Clock } from "lucide-react";
import { EmptyState } from "../EmptyState";

interface ScheduleEmptyStateProps {
  isAdmin?: boolean;
  onManageSchedule?: () => void;
}

export const ScheduleEmptyState: React.FC<ScheduleEmptyStateProps> = ({ 
  isAdmin, 
  onManageSchedule 
}) => {
  return (
    <EmptyState
      message={isAdmin 
        ? "No schedules have been created yet" 
        : "No shifts scheduled for this period"
      }
      icon={<Clock className="h-12 w-12 text-muted-foreground/50" />}
      action={isAdmin && onManageSchedule ? {
        label: "Manage Schedules",
        onClick: onManageSchedule
      } : undefined}
    />
  );
};
