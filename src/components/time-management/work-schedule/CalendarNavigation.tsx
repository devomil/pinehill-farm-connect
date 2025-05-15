
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, SquareCheck } from "lucide-react";
import { format } from "date-fns";

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
  const monthLabel = format(currentMonth, "MMMM yyyy");
  
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPreviousMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h3 className="font-medium">{monthLabel}</h3>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {selectionMode === "multiple" && (
        <div className="flex items-center text-sm text-muted-foreground">
          <SquareCheck className="h-4 w-4 mr-1" />
          <span>
            {selectedCount > 0
              ? `${selectedCount} ${selectedCount === 1 ? 'day' : 'days'} selected`
              : 'Selection mode'}
          </span>
        </div>
      )}
    </div>
  );
};
