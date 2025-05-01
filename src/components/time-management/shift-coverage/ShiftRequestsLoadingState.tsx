
import React from "react";

export const ShiftRequestsLoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading shift coverage requests...</p>
      </div>
    </div>
  );
};
