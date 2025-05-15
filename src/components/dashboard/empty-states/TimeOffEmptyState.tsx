
import React from "react";
import { FileText } from "lucide-react";
import { EmptyState } from "../EmptyState";

interface TimeOffEmptyStateProps {
  isAdmin?: boolean;
  onNewRequest?: () => void;
}

export const TimeOffEmptyState: React.FC<TimeOffEmptyStateProps> = ({ 
  isAdmin, 
  onNewRequest 
}) => {
  return (
    <EmptyState
      message={isAdmin 
        ? "No pending time off requests" 
        : "No time off requests"
      }
      icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
      action={!isAdmin && onNewRequest ? {
        label: "Request Time Off",
        onClick: onNewRequest
      } : undefined}
    />
  );
};
