
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarDays, Clock, Loader2, RefreshCw, X, Check } from "lucide-react";

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
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSetBulkMode("weekday")}
        disabled={loading || selectionMode === "multiple"}
      >
        <CalendarDays className="h-4 w-4 mr-1" />
        Add Weekday Shifts
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSetBulkMode("weekend")}
        disabled={loading || selectionMode === "multiple"}
      >
        <CalendarDays className="h-4 w-4 mr-1" />
        Add Weekend Shifts
      </Button>

      <Button
        variant={selectionMode === "multiple" ? "secondary" : "outline"}
        size="sm"
        onClick={onToggleSelectionMode}
        disabled={loading}
        className="flex items-center"
      >
        {selectionMode === "multiple" ? (
          <>
            <Check className="h-4 w-4 mr-1" />
            {selectedCount > 0 ? `${selectedCount} Days Selected` : "Select Specific Days"}
          </>
        ) : (
          <>
            <PlusCircle className="h-4 w-4 mr-1" />
            Select Specific Days
          </>
        )}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-1" />
        )}
        Reset Schedule
      </Button>
    </div>
  );
};
