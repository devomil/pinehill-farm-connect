
import React from "react";
import { Inbox } from "lucide-react";
import { EmptyState } from "../EmptyState";

interface TrainingEmptyStateProps {
  isAdmin?: boolean;
  onAddTraining?: () => void;
}

export const TrainingEmptyState: React.FC<TrainingEmptyStateProps> = ({ 
  isAdmin, 
  onAddTraining 
}) => {
  return (
    <EmptyState
      message={isAdmin 
        ? "No trainings have been created yet" 
        : "No trainings assigned"
      }
      icon={<Inbox className="h-12 w-12 text-muted-foreground/50" />}
      action={isAdmin && onAddTraining ? {
        label: "Add Training",
        onClick: onAddTraining
      } : undefined}
    />
  );
};
