
import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentMonth,
  onPrevMonth,
  onNextMonth,
}) => {
  const monthTitle = format(currentMonth, "MMMM yyyy");

  return (
    <>
      <div className="flex justify-between items-center p-2 bg-gray-50">
        <h3 className="text-lg font-medium">{monthTitle}</h3>
        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onPrevMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onNextMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 bg-muted/50">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium"
          >
            {day}
          </div>
        ))}
      </div>
    </>
  );
};
