
import React from "react";
import { format, isSameDay, isSameMonth } from "date-fns";
import { WorkShift } from "@/types/workSchedule";
import { CalendarDayCell } from "../CalendarDayCell";

interface CalendarDaysGridProps {
  days: Date[];
  currentMonth: Date;
  shiftsMap: Map<string, WorkShift[]>;
  selectedDate?: Date;
  onDayClick: (date: Date) => void;
  onShiftClick?: (day: Date, shift: WorkShift) => void;
  showEmployeeNames?: boolean;
}

export const CalendarDaysGrid: React.FC<CalendarDaysGridProps> = ({
  days,
  currentMonth,
  shiftsMap,
  selectedDate,
  onDayClick,
  onShiftClick,
  showEmployeeNames = false,
}) => {
  return (
    <div className="grid grid-cols-7 gap-1 p-1">
      {days.map((day, i) => {
        const dateKey = format(day, "yyyy-MM-dd");
        const shiftsForDay = shiftsMap.get(dateKey) || [];
        
        return (
          <CalendarDayCell
            key={i}
            date={day}
            shifts={shiftsForDay}
            isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
            outside={!isSameMonth(day, currentMonth)}
            today={isSameDay(day, new Date())}
            onClick={() => onDayClick(day)}
            onShiftClick={(shift) => onShiftClick && onShiftClick(day, shift)}
            showEmployeeNames={showEmployeeNames}
          />
        );
      })}
    </div>
  );
};
