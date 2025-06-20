
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { isValid, format, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { WorkShift } from "@/types/workSchedule";
import { CalendarNavigation } from "./CalendarNavigation";
import { CalendarDayCell } from "./CalendarDayCell";
import { safeFormat, getShiftsForDay } from "./calendarUtils";
import { EmployeeShiftDetailsDialog } from "./EmployeeShiftDetailsDialog";

interface EmployeeScheduleCalendarProps {
  currentDate: Date;
  shiftsMap: Map<string, WorkShift[]>;
  onDayClick: (day: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export const EmployeeScheduleCalendar: React.FC<EmployeeScheduleCalendarProps> = ({
  currentDate,
  shiftsMap,
  onDayClick,
  onPreviousMonth,
  onNextMonth,
}) => {
  const [selectedShiftDay, setSelectedShiftDay] = useState<Date | null>(null);
  const [selectedShifts, setSelectedShifts] = useState<WorkShift[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Ensure current date is valid
  const safeCurrentDate = isValid(currentDate) ? currentDate : new Date();

  // Generate days of the month to ensure calendar is populated
  const daysOfMonth = React.useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(safeCurrentDate),
      end: endOfMonth(safeCurrentDate)
    });
  }, [safeCurrentDate]);
  
  // Log days for debugging
  useEffect(() => {
    console.log(`EmployeeScheduleCalendar: ${daysOfMonth.length} days in month for ${format(safeCurrentDate, "MMMM yyyy")}`);
    console.log("First day:", format(daysOfMonth[0], "yyyy-MM-dd"), "Last day:", format(daysOfMonth[daysOfMonth.length - 1], "yyyy-MM-dd"));
  }, [daysOfMonth, safeCurrentDate]);

  // Handle day click with validation
  const handleDayClick = (day: Date) => {
    if (isValid(day)) {
      onDayClick(day);
    }
  };
  
  // Handle shift click
  const handleShiftClick = (day: Date, shifts: WorkShift[]) => {
    setSelectedShiftDay(day);
    setSelectedShifts(shifts);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-4">
      <CalendarNavigation
        currentMonth={safeCurrentDate}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
      />
      
      <div className="border rounded-lg p-2">
        <Calendar
          mode="default"
          month={safeCurrentDate}
          onDayClick={handleDayClick}
          showOutsideDays={true}
          components={{
            Day: ({ day, ...props }: any) => {
              if (!day || !isValid(day)) {
                return <div className="border border-dashed border-gray-200 h-9 w-9 p-0" />;
              }
              
              // Get shifts for this day
              const shifts = getShiftsForDay(day, shiftsMap);
              const hasShifts = shifts.length > 0;
              
              return (
                <CalendarDayCell
                  {...props}
                  day={day}
                  shifts={shifts}
                  hasShifts={hasShifts}
                  onClick={() => handleDayClick(day)}
                  onShiftClick={(shift) => handleShiftClick(day, shifts)}
                />
              );
            },
          }}
          className="w-full"
        />
      </div>
      
      {selectedShiftDay && isDetailsOpen && (
        <EmployeeShiftDetailsDialog
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          date={selectedShiftDay}
          shifts={selectedShifts}
        />
      )}
    </div>
  );
};
