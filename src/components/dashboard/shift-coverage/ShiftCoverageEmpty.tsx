
import React from "react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { RefreshCw, Clock } from "lucide-react";

interface ShiftCoverageEmptyProps {
  onRefresh: (e: React.MouseEvent) => void;
  inline?: boolean;
}

export const ShiftCoverageEmpty: React.FC<ShiftCoverageEmptyProps> = ({ 
  onRefresh, 
  inline = false 
}) => {
  const handleRefreshClick = () => {
    // Create a synthetic event for the onRefresh callback
    const syntheticEvent = { stopPropagation: () => {} } as React.MouseEvent;
    onRefresh(syntheticEvent);
  };
  
  return (
    <EmptyState
      message="No pending shift coverage requests"
      description="When shift coverage requests are submitted, they will appear here"
      icon={<Clock className="h-12 w-12 text-muted-foreground/50" />}
      action={{
        label: "Refresh",
        onClick: handleRefreshClick
      }}
      variant={inline ? "inline" : "card"}
    />
  );
};
