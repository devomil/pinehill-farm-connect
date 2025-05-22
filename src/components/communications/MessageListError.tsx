
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageListErrorProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function MessageListError({ onRefresh, isRefreshing }: MessageListErrorProps) {
  return (
    <div className="space-y-4">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>
          There was an issue loading your messages. Please try refreshing.
          
          <div className="mt-2">
            <Button 
              variant="outline" 
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Messages'}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
