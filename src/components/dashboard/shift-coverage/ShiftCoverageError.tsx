
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShiftCoverageErrorProps {
  onRefresh: () => void;
  inline?: boolean;
}

export const ShiftCoverageError: React.FC<ShiftCoverageErrorProps> = ({ 
  onRefresh,
  inline = false 
}) => {
  if (!inline) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load shift coverage requests
              {onRefresh && (
                <Button size="sm" variant="ghost" onClick={onRefresh} className="ml-2">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Alert variant="destructive" className="my-2">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex justify-between w-full items-center">
        <span>Failed to load shift coverage requests</span>
        {onRefresh && (
          <Button size="sm" variant="ghost" onClick={onRefresh}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
