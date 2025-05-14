
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { format, isValid } from "date-fns";

interface CalendarNavigationProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export const CalendarNavigation: React.FC<CalendarNavigationProps> = ({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
}) => {
  // Ensure current month is valid
  const safeCurrentMonth = isValid(currentMonth) ? currentMonth : new Date();
  
  // Safe format function that checks validity
  const safeFormat = (date: Date, formatString: string): string => {
    try {
      return isValid(date) ? format(date, formatString) : "";
    } catch (e) {
      console.error("Invalid date format:", e);
      return "";
    }
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <Button variant="ghost" onClick={onPreviousMonth} size="sm">
        <ArrowLeft className="h-4 w-4 mr-1" /> Previous
      </Button>
      <h3 className="font-semibold">{safeFormat(safeCurrentMonth, "MMMM yyyy")}</h3>
      <Button variant="ghost" onClick={onNextMonth} size="sm">
        Next <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};
