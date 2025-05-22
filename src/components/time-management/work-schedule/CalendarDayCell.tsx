
import React from "react";
import { WorkShift } from "@/types/workSchedule";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { User } from "lucide-react";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";

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
  showEmployeeNames?: boolean;
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
  today = false,
  showEmployeeNames = false
}) => {
  const hasShifts = shifts.length > 0;
  const dayNumber = date.getDate();
  const { employees } = useEmployeeDirectory();
  
  // Group shifts by employee
  const shiftsByEmployee = shifts.reduce((acc, shift) => {
    if (!acc[shift.employeeId]) {
      acc[shift.employeeId] = [];
    }
    acc[shift.employeeId].push(shift);
    return acc;
  }, {} as Record<string, WorkShift[]>);
  
  // Get employee name by ID
  const getEmployeeName = (employeeId: string): string => {
    const employee = employees?.find(emp => emp.id === employeeId);
    return employee ? employee.name.split(' ')[0] : 'Unknown'; // First name only for space reasons
  };
  
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
        "h-full w-full p-1 rounded-md flex flex-col relative cursor-pointer transition-all duration-150",
        outside && "opacity-50",
        disabled && "opacity-30 cursor-not-allowed",
        isSelected && selectionMode === "single" && "bg-primary text-primary-foreground shadow-md ring-2 ring-primary",
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
        "text-sm font-medium",
        isSelected && selectionMode === "single" && "text-white font-bold",
        isSelected && selectionMode === "multiple" && "text-orange-900 font-bold",
        isSelected && selectionMode === "range" && "text-blue-900 font-bold"
      )}>
        {dayNumber}
      </span>
      
      {hasShifts && (
        <div className="flex flex-col gap-0.5 mt-0.5 overflow-hidden">
          {/* Show max 3 employees or indicate more with a count */}
          {showEmployeeNames ? (
            // Display with employee names for admin view
            <div className="overflow-hidden w-full">
              {Object.keys(shiftsByEmployee).slice(0, 3).map((employeeId) => (
                <div 
                  key={employeeId}
                  className="flex items-center text-xs truncate w-full"
                  title={`${getEmployeeName(employeeId)} (${shiftsByEmployee[employeeId].length} shift${shiftsByEmployee[employeeId].length > 1 ? 's' : ''})`}
                  onClick={(e) => handleShiftClick(e, shiftsByEmployee[employeeId][0])}
                >
                  <span 
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mr-1",
                      isSelected && selectionMode === "single" ? "bg-white/80" : "bg-blue-500"
                    )}
                  />
                  <span className="truncate">{getEmployeeName(employeeId)}</span>
                </div>
              ))}
              {Object.keys(shiftsByEmployee).length > 3 && (
                <div className="text-xs text-blue-700 flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  <span>+{Object.keys(shiftsByEmployee).length - 3} more</span>
                </div>
              )}
            </div>
          ) : (
            // Display just indicators for employee view
            <div className="flex gap-0.5 flex-wrap">
              {shifts.slice(0, 3).map((shift, idx) => (
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
              {shifts.length > 3 && (
                <div className={cn(
                  "h-2 w-2 rounded-full relative",
                  isSelected && selectionMode === "single" ? "bg-white/80" : "bg-blue-500"
                )}>
                  <span className={cn(
                    "absolute -right-1 -top-0.5 text-xs",
                    isSelected && selectionMode === "single" ? "text-white" : "text-blue-700"
                  )}>+{shifts.length - 3}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
