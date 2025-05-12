
import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ShiftCoverageErrorProps {
  onRefresh: (e: React.MouseEvent) => void;
  inline?: boolean;
}

export const ShiftCoverageError: React.FC<ShiftCoverageErrorProps> = ({ 
  onRefresh, 
  inline = false 
}) => {
  const handleRefreshClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent parent click handlers from firing
    e.stopPropagation();
    onRefresh(e);
  };

  if (inline) {
    return (
      <Alert variant="destructive" className="my-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex justify-between w-full items-center">
          <span>Failed to load shift coverage requests</span>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleRefreshClick}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="text-center py-8">
      <h3 className="text-lg font-semibold text-red-500">Could not load data</h3>
      <p className="text-muted-foreground mb-4">
        There was a problem retrieving shift coverage requests.
      </p>
      <Button onClick={handleRefreshClick}>
        <RefreshCw className="h-3 w-3 mr-2" />
        Try Again
      </Button>
    </div>
  );
};
