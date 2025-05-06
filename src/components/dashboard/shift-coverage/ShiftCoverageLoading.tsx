
import React from "react";

export const ShiftCoverageLoading: React.FC = () => {
  return (
    <div className="space-y-2">
      <div className="animate-pulse h-6 bg-muted rounded w-3/4"></div>
      <div className="animate-pulse h-6 bg-muted rounded w-2/3"></div>
    </div>
  );
};
