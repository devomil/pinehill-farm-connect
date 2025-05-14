
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";

interface ScheduleActionBarProps {
  bulkMode: string | null;
  selectionMode: "single" | "multiple";
  loading?: boolean;
  selectedCount?: number;
  onToggleSelectionMode: () => void;
  onSetBulkMode: (mode: string | null) => void;
  onReset: () => void;
}

export const ScheduleActionBar: React.FC<ScheduleActionBarProps> = ({
  bulkMode,
  selectionMode,
  loading,
  selectedCount = 0,
  onToggleSelectionMode,
  onSetBulkMode,
  onReset
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSetBulkMode("weekdays")}
        disabled={loading || selectionMode === "multiple"}
      >
        Add Weekday Shifts
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSetBulkMode("weekend")}
        disabled={loading || selectionMode === "multiple"}
      >
        Add Weekend Shifts
      </Button>
      <Button
        variant={selectionMode === "multiple" ? "default" : "outline"}
        size="sm"
        onClick={onToggleSelectionMode}
        disabled={loading || bulkMode !== null}
        className="flex items-center gap-1"
      >
        {selectionMode === "multiple" ? (
          <>
            <CheckSquare className="h-4 w-4" /> 
            {selectedCount > 0 ? `${selectedCount} Day${selectedCount !== 1 ? 's' : ''} Selected` : 'Done Selecting'}
          </>
        ) : (
          'Select Specific Days'
        )}
      </Button>
      <Button
        variant="outline" 
        size="sm"
        onClick={onReset}
        disabled={loading}
      >
        Reset Schedule
      </Button>
    </div>
  );
};
