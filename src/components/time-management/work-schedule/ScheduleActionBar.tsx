
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarDays, Loader2, RefreshCw, CalendarRange } from "lucide-react";

interface ScheduleActionBarProps {
  bulkMode: string | null;
  selectionMode: "single" | "multiple" | "range";
  loading?: boolean;
  selectedCount?: number;
  onToggleSelectionMode: () => void;
  onSetBulkMode: (mode: string | null) => void;
  onReset: () => void;
  onToggleRangeMode: () => void;
}

export const ScheduleActionBar: React.FC<ScheduleActionBarProps> = ({
  bulkMode,
  selectionMode,
  loading,
  selectedCount = 0,
  onToggleSelectionMode,
  onSetBulkMode,
  onReset,
  onToggleRangeMode
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSetBulkMode("weekday")}
        disabled={loading || selectionMode !== "single"}
      >
        <CalendarDays className="h-4 w-4 mr-1" />
        Add Weekday Shifts
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSetBulkMode("weekend")}
        disabled={loading || selectionMode !== "single"}
      >
        <CalendarDays className="h-4 w-4 mr-1" />
        Add Weekend Shifts
      </Button>

      <Button
        variant={selectionMode === "multiple" ? "secondary" : "outline"}
        size="sm"
        onClick={onToggleSelectionMode}
        disabled={loading || selectionMode === "range"}
        className={`flex items-center ${selectionMode === "multiple" ? "bg-orange-200 hover:bg-orange-300 text-orange-900 border-orange-500" : ""}`}
      >
        {selectionMode === "multiple" ? (
          <>
            <PlusCircle className="h-4 w-4 mr-1" />
            {selectedCount > 0 ? `${selectedCount} Days Selected` : "Select Days (Click Calendar)"}
          </>
        ) : (
          <>
            <PlusCircle className="h-4 w-4 mr-1" />
            Select Specific Days
          </>
        )}
      </Button>
      
      <Button
        variant={selectionMode === "range" ? "secondary" : "outline"}
        size="sm"
        onClick={onToggleRangeMode}
        disabled={loading}
        className={`flex items-center ${selectionMode === "range" ? "bg-blue-200 hover:bg-blue-300 text-blue-900 border-blue-500" : ""}`}
      >
        <CalendarRange className="h-4 w-4 mr-1" />
        {selectionMode === "range" ? "Exit Date Range Mode" : "Select Date Range"}
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
