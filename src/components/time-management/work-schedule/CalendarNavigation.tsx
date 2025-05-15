
import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckSquare } from "lucide-react";

interface CalendarNavigationProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  selectionMode?: "single" | "multiple";
  selectedCount?: number;
}

export const CalendarNavigation: React.FC<CalendarNavigationProps> = ({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  selectionMode,
  selectedCount = 0
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <h3 className="text-lg font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        
        {selectionMode === "multiple" && selectedCount > 0 && (
          <div className="ml-4 flex items-center text-sm text-primary">
            <CheckSquare className="h-4 w-4 mr-1" />
            <span>{selectedCount} {selectedCount === 1 ? 'day' : 'days'} selected</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" onClick={onPreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
