
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShiftCoverageErrorDebugPanel } from "./ShiftCoverageErrorDebugPanel";

interface ShiftRequestsErrorStateProps {
  error: any;
  onRetry: () => void;
}

export const ShiftRequestsErrorState: React.FC<ShiftRequestsErrorStateProps> = ({
  error,
  onRetry
}) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-xl">Shift Coverage Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-6 text-center space-y-4">
          <p className="text-red-500 font-medium">Failed to load shift coverage requests</p>
          <p className="text-sm text-muted-foreground">
            There was an error loading your shift coverage requests. Please try again.
          </p>
          <Button onClick={onRetry}>Retry</Button>
          
          <ShiftCoverageErrorDebugPanel error={error} />
        </div>
      </CardContent>
    </Card>
  );
};
