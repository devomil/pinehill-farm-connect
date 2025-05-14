
import React from "react";

interface WorkScheduleErrorProps {
  error: Error;
}

export const WorkScheduleError: React.FC<WorkScheduleErrorProps> = ({ error }) => {
  return (
    <div className="text-destructive p-4 border border-destructive/20 rounded-md bg-destructive/5">
      Error loading schedule data: {error.message}
    </div>
  );
};
