
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { isValid } from "date-fns";
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
          components={{
            Day: ({ day, ...props }: any) => {
              if (!day || !isValid(day)) {
                return null;
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
