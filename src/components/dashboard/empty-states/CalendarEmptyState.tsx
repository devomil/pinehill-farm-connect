
import React from "react";
import { Calendar } from "lucide-react";
import { EmptyState } from "../EmptyState";
import { Button } from "@/components/ui/button";

interface CalendarEmptyStateProps {
  onAddEvent?: () => void;
}

export const CalendarEmptyState: React.FC<CalendarEmptyStateProps> = ({ onAddEvent }) => {
  return (
    <EmptyState
      message="No calendar events scheduled"
      icon={<Calendar className="h-12 w-12 text-muted-foreground/50" />}
      action={onAddEvent ? {
        label: "Add Event",
        onClick: onAddEvent
      } : undefined}
    />
  );
};
