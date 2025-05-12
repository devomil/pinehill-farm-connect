
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ShiftCoverageEmptyProps {
  onRefresh: (e: React.MouseEvent) => void;
  inline?: boolean;
}

export const ShiftCoverageEmpty: React.FC<ShiftCoverageEmptyProps> = ({ onRefresh, inline = false }) => {
  const handleRefreshClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent parent click handlers from firing
    e.stopPropagation();
    onRefresh(e);
  };
  
  return (
    <div className={`text-center ${inline ? 'py-2' : 'py-6'} text-muted-foreground`}>
      <p>No pending shift coverage requests</p>
      {onRefresh && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefreshClick} 
          className="mt-2"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      )}
    </div>
  );
};
