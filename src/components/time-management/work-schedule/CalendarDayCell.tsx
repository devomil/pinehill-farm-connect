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
  const employeeNames = React.useMemo(() => {
    if (!showEmployeeNames || !hasShifts) return [];
    
    // Extract unique employee names from shift notes or IDs
    const uniqueEmployees = new Set<string>();
    
    shifts.forEach(shift => {
      if (shift.notes) {
        // Try to extract employee name from notes
        const nameParts = shift.notes.split(':');
        if (nameParts.length > 1) {
          uniqueEmployees.add(nameParts[1].trim());
        } else if (shift.notes.includes('@')) {
          // If notes contains an email format, get the part before @
          const emailPart = shift.notes.split('@')[0];
          uniqueEmployees.add(emailPart.trim());
        } else {
          // Otherwise use a portion of notes
          uniqueEmployees.add(shift.notes.substring(0, 20).trim());
        }
      } else {
        // If no notes, use a portion of the employee ID
        const shortId = shift.employeeId.substring(0, 6);
        uniqueEmployees.add(`Employee ${shortId}`);
      }
    });
    
    return Array.from(uniqueEmployees).slice(0, 4); // Limit to avoid overcrowding
  }, [shifts, showEmployeeNames, hasShifts]);

  // Get the name from the shift data - in a real app this would use a lookup
  const getEmployeeName = (shift: WorkShift) => {
    if (shift.notes) {
      const nameParts = shift.notes.split(':');
      if (nameParts.length > 1) {
        return nameParts[1].trim();
      } else {
        return shift.notes.substring(0, 15);
      }
    }
    return `Employee ${shift.employeeId.substring(0, 6)}`;
  };
  
  // Handle showing more indicator if there are more shifts than we display
  const hasMoreShifts = showEmployeeNames && employeeNames.length > 3;
  const displayedNames = hasMoreShifts ? employeeNames.slice(0, 3) : employeeNames;
  const moreCount = hasMoreShifts ? employeeNames.length - 3 : 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "h-full min-h-[90px] p-1 border border-gray-200 rounded-sm flex flex-col",
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
        {showEmployeeNames && displayedNames.length > 0 ? (
          <div className="mt-1 space-y-1">
            {displayedNames.map((name, idx) => (
              <div key={idx} className="flex items-center text-xs">
                <span className="h-2 w-2 rounded-full bg-blue-500 mr-1"></span>
                <span className="truncate">{name}</span>
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
