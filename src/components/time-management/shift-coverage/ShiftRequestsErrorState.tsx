
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ShiftRequestsErrorStateProps {
  onRetry: () => void;
}

export const ShiftRequestsErrorState: React.FC<ShiftRequestsErrorStateProps> = ({ onRetry }) => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error loading shift coverage requests</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>There was a problem loading your shift coverage requests. Please try again.</p>
        <Button variant="outline" size="sm" className="w-fit" onClick={onRetry}>
          <RefreshCw className="mr-2 h-3 w-3" /> Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
};
