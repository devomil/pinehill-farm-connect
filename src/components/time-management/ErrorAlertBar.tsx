
import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorAlertBarProps {
  error: any;
  messagesError?: any;
  onRetry: () => void;
}

export const ErrorAlertBar: React.FC<ErrorAlertBarProps> = ({ error, messagesError, onRetry }) => {
  // Format error messages safely for display
  const formatErrorMessage = (err: any): React.ReactNode => {
    if (typeof err === 'string') return err;
    if (err?.message) return err.message;
    return "Unknown error";
  };

  // Show any errors at the top of the tabs area
  const hasErrors = error || messagesError;
  
  if (!hasErrors) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Error loading data: {formatErrorMessage(error || messagesError)}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry} 
          className="ml-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
};
