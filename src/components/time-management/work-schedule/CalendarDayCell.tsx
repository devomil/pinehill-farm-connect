
import React from "react";
import { WorkShift } from "@/types/workSchedule";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CalendarDayCellProps {
  date: Date;
  shifts: WorkShift[];
  isSelected?: boolean;
  selectionMode?: "single" | "multiple";
  onShiftClick?: (shift: WorkShift) => void;
  onSelect?: () => void;
  outside?: boolean;
  disabled?: boolean;
  today?: boolean;
}

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  date,
  shifts,
  isSelected,
  selectionMode = "single",
  onShiftClick,
  onSelect,
  outside = false,
  disabled = false,
  today = false
}) => {
  const hasShifts = shifts.length > 0;
  const dayNumber = date.getDate();
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    
    if (disabled) return;
    
    if (onSelect) {
      onSelect();
    }
  };
  
  const handleShiftClick = (e: React.MouseEvent, shift: WorkShift) => {
    e.stopPropagation(); // Prevent parent click
    
    if (onShiftClick) {
      onShiftClick(shift);
    }
  };
  
  return (
    <div
      className={cn(
        "h-12 w-12 p-0 rounded-md flex flex-col items-center relative cursor-pointer",
        outside && "opacity-50",
        disabled && "opacity-30 cursor-not-allowed",
        isSelected && "bg-primary/20 border-2 border-primary",
        !isSelected && hasShifts && "bg-blue-50",
        today && !isSelected && "bg-accent/50"
      )}
      onClick={handleClick}
      aria-selected={isSelected}
    >
      <span className={cn(
        "text-sm font-medium mt-1",
        isSelected && "text-primary font-bold"
      )}>
        {dayNumber}
      </span>
      
      {hasShifts && (
        <div className="flex gap-0.5 mt-0.5 mb-0.5">
          {shifts.slice(0, 2).map((shift, idx) => (
            <div
              key={idx}
              className="h-1.5 w-1.5 rounded-full bg-blue-500"
              title={`${format(new Date(`${shift.date}T${shift.startTime}`), 'HH:mm')} - ${format(new Date(`${shift.date}T${shift.endTime}`), 'HH:mm')}`}
              onClick={(e) => handleShiftClick(e, shift)}
            />
          ))}
          {shifts.length > 2 && (
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 relative">
              <span className="absolute -right-1 -top-0.5 text-xs">+{shifts.length - 2}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
