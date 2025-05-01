
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorAlertProps {
  onRetry: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ onRetry }) => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error Loading Data</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>There was a problem loading your time management data.</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRetry}
          className="ml-2 whitespace-nowrap"
        >
          <RefreshCw className="mr-2 h-3 w-3" /> Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
};
