
import React from "react";
import { format, isToday, isSameMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { WorkShift } from "@/types/workSchedule";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";

interface CalendarDayCellProps {
  date: Date;
  shifts: WorkShift[];
  isSelected?: boolean;
  outside?: boolean;
  today?: boolean;
  onClick?: () => void;
  onShiftClick?: (shift: WorkShift) => void;
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
  showEmployeeNames = false,
}) => {
  const { employees } = useEmployeeDirectory();
  
  // Helper function to get employee name by ID
  const getEmployeeNameById = (id: string): string => {
    const employee = employees.find(emp => emp.id === id);
    return employee ? employee.name : 'Unknown';
  };
  
  // Format shifts for display
  const formattedShifts = shifts.slice(0, 3).map(shift => {
    const startTime = shift.startTime.substring(0, 5);
    const endTime = shift.endTime.substring(0, 5);
    const employeeName = showEmployeeNames ? getEmployeeNameById(shift.employeeId) : '';
    
    return {
      id: shift.id,
      time: `${startTime}-${endTime}`,
      employee: employeeName,
      color: 'bg-green-100 border-green-200',
      original: shift
    };
  });
  
  // Show indicator for more shifts if there are more than we display
  const hasMoreShifts = shifts.length > 3;
  
  return (
    <div
      className={cn(
        "h-24 min-h-[6rem] p-1 border flex flex-col relative",
        outside ? "bg-slate-50 text-slate-400" : "bg-white",
        today ? "border-blue-300" : "border-slate-200",
        isSelected ? "bg-blue-50 border-blue-400" : ""
      )}
      onClick={onClick}
    >
      <div className={cn(
        "text-center w-6 h-6 mb-1",
        today ? "bg-blue-500 text-white rounded-full" : ""
      )}>
        {format(date, "d")}
      </div>
      
      <div className="flex-1 overflow-hidden space-y-1">
        {formattedShifts.map((shift, idx) => (
          <div
            key={shift.id}
            className={cn(
              "text-xs p-0.5 px-1 rounded border truncate cursor-pointer",
              shift.color
            )}
            onClick={(e) => {
              e.stopPropagation();
              onShiftClick && onShiftClick(shift.original);
            }}
          >
            <div className="font-medium truncate">
              {shift.time}
            </div>
            {showEmployeeNames && shift.employee && (
              <div className="text-xs truncate text-gray-600">
                {shift.employee}
              </div>
            )}
          </div>
        ))}
        
        {hasMoreShifts && (
          <div className="text-xs text-center text-gray-500 bg-gray-100 rounded px-1">
            +{shifts.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};
