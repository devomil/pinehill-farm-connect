
import React from "react";
import { format, isValid } from "date-fns";
import { WorkShift } from "@/types/workSchedule";

interface CalendarDayCellProps {
  day: Date;
  shifts: WorkShift[];
  isSingleSelected?: boolean;
  isMultiSelected?: boolean;
  hasShifts?: boolean;
  onClick: () => void;
  onShiftClick: (shift: WorkShift) => void;
}

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  day,
  shifts,
  isSingleSelected,
  isMultiSelected,
  hasShifts,
  onClick,
  onShiftClick,
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
    const classes = ["h-20 w-full border rounded-md p-1 cursor-pointer"];
    
    if (hasShifts) {
      classes.push("bg-primary/5");
    }
    
    if (isSingleSelected) {
      classes.push("ring-2 ring-primary");
    }
    
    if (isMultiSelected) {
      classes.push("bg-primary/20 border-primary");
    }
    
    classes.push("hover:bg-accent");
    
    return classes.join(" ");
  };

  return (
    <div className={getClassNames()} onClick={onClick}>
      <div className="h-full w-full">
        <div className="text-right text-xs">{safeFormat(day, "d")}</div>
        
        {/* Show selection indicator for multi-select mode */}
        {isMultiSelected && (
          <div className="absolute top-1 left-1 h-2 w-2 rounded-full bg-primary"></div>
        )}
        
        {shifts.length > 0 && (
          <div className="mt-1">
            {shifts.map((shift, index) => (
              <div 
                key={`${shift.id}-${index}`}
                className="bg-primary/10 text-xs p-1 rounded mt-1 cursor-pointer hover:bg-primary/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onShiftClick(shift);
                }}
              >
                {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
