
import React from "react";
import { WorkShift } from "@/types/workSchedule";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CalendarDayCellProps {
  date: Date;
  shifts: WorkShift[];
  isSelected?: boolean;
  selectionMode?: "single" | "multiple" | "range";
  onShiftClick?: (shift: WorkShift) => void;
  onClick?: () => void;
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
  onClick,
  outside = false,
  disabled = false,
  today = false
}) => {
  const hasShifts = shifts.length > 0;
  const dayNumber = date.getDate();
  
  const handleClick = () => {
    if (disabled) return;
    
    console.log(`Day clicked: ${format(date, 'yyyy-MM-dd')}, calling onClick handler`);
    
    if (onClick) {
      onClick();
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
        "h-12 w-12 p-0 rounded-md flex flex-col items-center relative cursor-pointer transition-all duration-150",
        outside && "opacity-50",
        disabled && "opacity-30 cursor-not-allowed",
        isSelected && selectionMode === "single" && "bg-primary text-primary-foreground shadow-md ring-2 ring-primary scale-105",
        isSelected && selectionMode === "multiple" && "bg-orange-200 ring-2 ring-orange-500",
        isSelected && selectionMode === "range" && "bg-blue-200 ring-2 ring-blue-500",
        !isSelected && hasShifts && "bg-blue-50 hover:bg-blue-100",
        today && !isSelected && "bg-accent/50",
        !isSelected && !disabled && selectionMode === "single" && "hover:bg-primary/10",
        !isSelected && !disabled && selectionMode === "multiple" && "hover:bg-orange-100",
        !isSelected && !disabled && selectionMode === "range" && "hover:bg-blue-100"
      )}
      onClick={handleClick}
      aria-selected={isSelected}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      <span className={cn(
        "text-sm font-medium mt-1",
        isSelected && selectionMode === "single" && "text-white font-bold",
        isSelected && selectionMode === "multiple" && "text-orange-900 font-bold",
        isSelected && selectionMode === "range" && "text-blue-900 font-bold"
      )}>
        {dayNumber}
      </span>
      
      {hasShifts && (
        <div className="flex gap-0.5 mt-0.5 mb-0.5">
          {shifts.slice(0, 2).map((shift, idx) => (
            <div
              key={idx}
              className={cn(
                "h-2 w-2 rounded-full",
                isSelected && selectionMode === "single" ? "bg-white/80" : "bg-blue-500"
              )}
              title={`${format(new Date(`${shift.date}T${shift.startTime}`), 'HH:mm')} - ${format(new Date(`${shift.date}T${shift.endTime}`), 'HH:mm')}`}
              onClick={(e) => handleShiftClick(e, shift)}
            />
          ))}
          {shifts.length > 2 && (
            <div className={cn(
              "h-2 w-2 rounded-full relative",
              isSelected && selectionMode === "single" ? "bg-white/80" : "bg-blue-500"
            )}>
              <span className={cn(
                "absolute -right-1 -top-0.5 text-xs",
                isSelected && selectionMode === "single" ? "text-white" : "text-blue-700"
              )}>+{shifts.length - 2}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
