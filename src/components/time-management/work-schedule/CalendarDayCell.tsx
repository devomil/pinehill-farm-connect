
import React from "react";
import { format, isValid } from "date-fns";
import { WorkShift } from "@/types/workSchedule";
import { Briefcase, CheckSquare } from "lucide-react";

interface CalendarDayCellProps {
  day: Date;
  shifts: WorkShift[];
  isSingleSelected?: boolean;
  isMultiSelected?: boolean;
  hasShifts?: boolean;
  onClick: () => void;
  onShiftClick: (shift: WorkShift) => void;
  selectionMode?: "single" | "multiple";
}

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  day,
  shifts,
  isSingleSelected,
  isMultiSelected,
  hasShifts,
  onClick,
  onShiftClick,
  selectionMode = "single"
}) => {
  // Safe format function that checks validity
  const safeFormat = (date: Date, formatString: string): string => {
    try {
      return isValid(date) ? format(date, formatString) : "";
    } catch (e) {
      console.error("Invalid date format:", e);
      return "";
    }
  };

  // Generate CSS classes for the day cell
  const getClassNames = () => {
    const classes = ["h-20 w-full border rounded-md p-1 relative cursor-pointer pointer-events-auto"];
    
    if (hasShifts) {
      classes.push("bg-primary/5");
    }
    
    if (isSingleSelected) {
      classes.push("ring-2 ring-primary");
    }
    
    if (isMultiSelected) {
      classes.push("bg-primary/20 border-primary-500 ring-1 ring-primary");
    }
    
    if (selectionMode === "multiple") {
      classes.push("hover:bg-primary/10");
    } else {
      classes.push("hover:bg-accent");
    }
    
    return classes.join(" ");
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const handleShiftClick = (e: React.MouseEvent, shift: WorkShift) => {
    e.stopPropagation();
    onShiftClick(shift);
  };

  // Add explicit day label display
  const dayNumber = safeFormat(day, "d");

  return (
    <div className={getClassNames()} onClick={handleClick}>
      <div className="h-full w-full">
        <div className="text-right text-xs font-semibold">{dayNumber}</div>
        
        {/* Show selection indicator for multi-select mode */}
        {isMultiSelected && (
          <div className="absolute top-1 left-1">
            <CheckSquare className="h-4 w-4 text-primary" />
          </div>
        )}
        
        {shifts.length > 0 && (
          <div className="mt-1">
            {shifts.map((shift, index) => (
              <div 
                key={`${shift.id}-${index}`}
                className="bg-primary/10 text-xs p-1 rounded mt-1 cursor-pointer hover:bg-primary/20 flex items-center gap-1"
                onClick={(e) => handleShiftClick(e, shift)}
              >
                <Briefcase className="h-2 w-2" />
                <span>{shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
