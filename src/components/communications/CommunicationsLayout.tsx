
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommunicationsLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  error?: Error | string | null;
  loading?: boolean;
  onRetry?: () => void;
  isConnectionError?: boolean;
  retryCount?: number;
}

export const CommunicationsLayout: React.FC<CommunicationsLayoutProps> = ({
  children,
  title = "Direct Messages",
  description = "Message your colleagues directly and manage shift coverage requests",
  error,
  loading,
  onRetry,
  isConnectionError = false,
  retryCount = 0,
}) => {
  const formatErrorMessage = (error: Error | string | null): string => {
    if (!error) return "Unknown error";
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return "Unknown error";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        
        {isConnectionError ? (
          <Alert variant="destructive" className="bg-amber-50 border-amber-200">
            <WifiOff className="h-4 w-4 text-amber-800" />
            <AlertDescription className="text-amber-800 flex flex-col space-y-2">
              <p>There seems to be a connection issue. Unable to load messages.</p>
              {retryCount > 0 && (
                <p className="text-xs text-amber-700">Attempted {retryCount} {retryCount === 1 ? 'retry' : 'retries'}</p>
              )}
              {onRetry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-fit mt-2 border-amber-500 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                  onClick={onRetry}
                >
                  Retry Connection
                </Button>
              )}
            </AlertDescription>
          </Alert>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading data: {formatErrorMessage(error)}
            </AlertDescription>
          </Alert>
        ) : null}
        
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading message data...</span>
          </div>
        ) : (
          children
        )}
      </div>
    </DashboardLayout>
  );
};
