
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, RefreshCw, CalendarRange, Calendar, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ScheduleActionBarProps {
  bulkMode: string | null;
  selectionMode: "single" | "multiple" | "range";
  loading?: boolean;
  selectedCount?: number;
  onToggleSelectionMode: () => void;
  onSetBulkMode: (mode: string | null) => void;
  onReset: () => void;
  onToggleRangeMode: () => void;
  showAdminTools?: boolean;
  onToggleAdminTools?: () => void;
}

export const ScheduleActionBar: React.FC<ScheduleActionBarProps> = ({
  bulkMode,
  selectionMode,
  loading,
  selectedCount = 0,
  onToggleSelectionMode,
  onSetBulkMode,
  onReset,
  onToggleRangeMode,
  showAdminTools = false,
  onToggleAdminTools
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Selection Mode Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center">
            {selectionMode === "single" && <Calendar className="h-4 w-4 mr-1" />}
            {selectionMode === "multiple" && <PlusCircle className="h-4 w-4 mr-1" />}
            {selectionMode === "range" && <CalendarRange className="h-4 w-4 mr-1" />}
            
            {selectionMode === "single" && "Single Day"}
            {selectionMode === "multiple" && (selectedCount > 0 ? `${selectedCount} Days Selected` : "Multiple Days")}
            {selectionMode === "range" && "Date Range"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Selection Mode</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => {
              if (selectionMode !== "single") {
                onToggleSelectionMode();
              }
            }}
            disabled={loading}
            className={selectionMode === "single" ? "bg-primary/10" : ""}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Single Day Selection
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={onToggleSelectionMode} 
            disabled={loading || selectionMode === "range"}
            className={selectionMode === "multiple" ? "bg-primary/10" : ""}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Multiple Day Selection
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={onToggleRangeMode}
            disabled={loading}
            className={selectionMode === "range" ? "bg-primary/10" : ""}
          >
            <CalendarRange className="h-4 w-4 mr-1" />
            Date Range Selection
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Bulk Actions Dropdown - Only show if in single mode */}
      {selectionMode === "single" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={loading}>
              Bulk Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Quick Schedule</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onSetBulkMode("weekday")}>
              Add Weekday Shifts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSetBulkMode("weekend")}>
              Add Weekend Shifts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      {/* Reset Button */}
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
      
      {/* Settings Menu */}
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onToggleAdminTools}>
              {showAdminTools ? "Hide Admin Tools" : "Show Admin Tools"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
