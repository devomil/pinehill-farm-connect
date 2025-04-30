
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CommunicationsLayoutProps {
  children: React.ReactNode;
  error: any;
  loading: boolean;
  isConnectionError: boolean;
  onRetry: () => void;
  retryCount: number;
  onRefresh?: () => void; // Add refresh handler
}

export function CommunicationsLayout({
  children,
  error,
  loading,
  isConnectionError,
  onRetry,
  retryCount,
  onRefresh
}: CommunicationsLayoutProps) {
  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error Loading Communications</AlertTitle>
          <AlertDescription>
            {isConnectionError
              ? "Unable to connect to the server. Please check your internet connection."
              : `An error occurred: ${error.message || "Unknown error"}`}
          </AlertDescription>
          <div className="mt-4 flex space-x-2">
            <Button variant="outline" onClick={onRetry} disabled={retryCount >= 3}>
              {retryCount > 0 ? `Retry (${retryCount}/3)` : "Retry"}
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {onRefresh && (
        <div className="flex justify-end mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      )}
      {children}
    </div>
  );
}
