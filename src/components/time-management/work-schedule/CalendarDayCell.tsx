
import React from "react";
import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { WorkShift } from "@/types/workSchedule";
import { User } from "lucide-react";

interface CalendarDayCellProps {
  date: Date;
  shifts: WorkShift[];
  isSelected?: boolean;
  outside?: boolean;
  today?: boolean;
  onClick?: () => void;
  onShiftClick?: (shift: WorkShift) => void;
  isDaySelected?: boolean;
  showEmployeeNames?: boolean;
}

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  date,
  shifts,
  isSelected = false,
  outside = false,
  today = false,
  onClick,
  onShiftClick,
  isDaySelected,
  showEmployeeNames = false,
}) => {
  const dayNumber = format(date, "d");
  const hasShifts = shifts && shifts.length > 0;
  
  // Group shifts by employee if showing names
  const employeeShifts = React.useMemo(() => {
    if (!showEmployeeNames || !hasShifts) return [];
    
    // Extract unique employee names and their shift times from shifts
    return shifts.map(shift => {
      let employeeName = "Employee";
      const startTime = shift.startTime.substring(0, 5);  // Format: HH:MM
      const endTime = shift.endTime.substring(0, 5);      // Format: HH:MM
      
      if (shift.notes) {
        // Try to extract employee name from notes
        const nameParts = shift.notes.split(':');
        if (nameParts.length > 1) {
          employeeName = nameParts[1].trim();
        } else if (shift.notes.includes('@')) {
          // If notes contains an email format, get the part before @
          const emailPart = shift.notes.split('@')[0];
          employeeName = emailPart.trim();
        } else {
          // Otherwise use a portion of notes
          employeeName = shift.notes.substring(0, 15).trim();
        }
      } else if (shift.employeeId) {
        // If no notes but we have employeeId, use a shortened version
        employeeName = `Employee ${shift.employeeId.substring(0, 6)}`;
      }
      
      return {
        name: employeeName,
        timeRange: `${startTime} - ${endTime}`,
        shift
      };
    });
  }, [shifts, showEmployeeNames, hasShifts]);

  // Handle showing more indicator if there are more shifts than we display
  const hasMoreShifts = employeeShifts.length > 3;
  const displayedShifts = hasMoreShifts ? employeeShifts.slice(0, 3) : employeeShifts;
  const moreCount = hasMoreShifts ? employeeShifts.length - 3 : 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "min-h-[80px] p-1 border border-gray-200 rounded-md flex flex-col",
        outside ? "bg-gray-50 text-gray-400" : "bg-white",
        today ? "border-blue-500" : "",
        isSelected ? "bg-blue-50 border-blue-500" : "",
        isDaySelected ? "ring-2 ring-accent" : "",
        "transition-colors hover:bg-gray-50 cursor-pointer"
      )}
    >
      <div className="text-right text-sm font-medium">
        {dayNumber}
      </div>
      
      <div className="flex-1 overflow-hidden">
        {showEmployeeNames && displayedShifts.length > 0 ? (
          <div className="mt-1 space-y-1">
            {displayedShifts.map((shiftInfo, idx) => (
              <div 
                key={idx} 
                className="flex items-center text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onShiftClick && onShiftClick(shiftInfo.shift);
                }}
              >
                <span className="h-2 w-2 rounded-full bg-blue-500 mr-1"></span>
                <div className="truncate flex flex-col">
                  <span className="font-medium truncate">{shiftInfo.name}</span>
                  <span className="text-gray-500 truncate">{shiftInfo.timeRange}</span>
                </div>
              </div>
            ))}
            {hasMoreShifts && (
              <div className="text-xs text-gray-500 font-medium">
                +{moreCount} more
              </div>
            )}
          </div>
        ) : (
          hasShifts && !showEmployeeNames && (
            <div className="mt-2 flex justify-center">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100">
                <User className="h-3 w-3 text-green-700" />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
