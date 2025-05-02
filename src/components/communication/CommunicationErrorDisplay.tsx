
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface CommunicationErrorDisplayProps {
  error: any;
  onRefresh: () => void;
}

export const CommunicationErrorDisplay: React.FC<CommunicationErrorDisplayProps> = ({
  error,
  onRefresh
}) => {
  // Format error messages safely
  const formatErrorMessage = (err: any): React.ReactNode => {
    if (typeof err === 'string') return err;
    if (err?.message) return err.message;
    return "Unknown error";
  };

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Error loading data: {formatErrorMessage(error)}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          className="ml-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
};
