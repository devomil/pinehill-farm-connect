
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface CalendarNavigationProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarNavigation({ 
  currentMonth, 
  onPreviousMonth, 
  onNextMonth 
}: CalendarNavigationProps) {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onPreviousMonth}
        className="rounded-full p-2 hover:bg-muted"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="font-medium">
        {format(currentMonth, "MMMM yyyy")}
      </span>
      <button
        onClick={onNextMonth}
        className="rounded-full p-2 hover:bg-muted"
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
