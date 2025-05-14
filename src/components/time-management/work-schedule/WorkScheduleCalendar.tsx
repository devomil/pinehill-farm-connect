
import React, { useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { isValid } from "date-fns";
import { WorkShift } from "@/types/workSchedule";
import { CalendarNavigation } from "./CalendarNavigation";
import { CalendarDayCell } from "./CalendarDayCell";
import { safeFormat, isDateSelected, getShiftsForDay, getDebugInfo } from "./calendarUtils";

interface WorkScheduleCalendarProps {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  shiftsMap: Map<string, WorkShift[]>;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  onDateSelected: () => void;
  onShiftClick: (shift: WorkShift) => void;
  selectionMode?: "single" | "multiple";
  isDaySelected?: (date: Date) => boolean;
  onDayToggle?: (date: Date) => void;
}

export const WorkScheduleCalendar: React.FC<WorkScheduleCalendarProps> = ({
  currentMonth,
  setCurrentMonth,
  shiftsMap,
  selectedDate,
  setSelectedDate,
  onDateSelected,
  onShiftClick,
  selectionMode = "single",
  isDaySelected,
  onDayToggle
}) => {
  // Ensure current month is valid
  const safeCurrentMonth = isValid(currentMonth) ? currentMonth : new Date();
  
  // Debug calendar data on mount and when key props change
  useEffect(() => {
    getDebugInfo(safeCurrentMonth, shiftsMap, selectedDate, isDaySelected);
    console.log("WorkScheduleCalendar rendered with selectionMode:", selectionMode);
  }, [safeCurrentMonth, shiftsMap, selectedDate, isDaySelected, selectionMode]);
  
  // Handle previous month click
  const handlePreviousMonth = () => {
    const prevMonth = new Date(safeCurrentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };
  
  // Handle next month click
  const handleNextMonth = () => {
    const nextMonth = new Date(safeCurrentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  
  // Handle day click - depends on selection mode
  const handleDayClick = (day: Date | undefined) => {
    if (!day || !isValid(day)) return;
    
    if (selectionMode === "multiple" && onDayToggle) {
      console.log("Toggle day selection for:", safeFormat(day, "yyyy-MM-dd"));
      onDayToggle(day);
    } else {
      console.log("Set selected date to:", safeFormat(day, "yyyy-MM-dd"));
      setSelectedDate(day);
      onDateSelected();
    }
  };

  return (
    <>
      <CalendarNavigation 
        currentMonth={safeCurrentMonth}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />
      
      <div className="border rounded-lg p-2">
        <Calendar
          mode="default" // Use "default" instead of "single" to ensure days are shown
          selected={selectionMode === "single" ? selectedDate : undefined}
          month={safeCurrentMonth}
          onDayClick={handleDayClick}
          components={{
            Day: ({ day, ...props }: any) => {
              // Add debug log for day rendering
              console.log("Rendering day:", day ? safeFormat(day, "yyyy-MM-dd") : "undefined day");
              
              if (!day || !isValid(day)) {
                console.warn("Invalid day in calendar:", day);
                return null;
              }
              
              // Get shifts for this day
              const shifts = getShiftsForDay(day, shiftsMap);
              const hasShifts = shifts.length > 0;
              
              // Check if this day is selected in single or multiple mode
              const { isSingleSelected, isMultiSelected } = isDateSelected(
                day, 
                selectedDate,
                isDaySelected
              );
              
              return (
                <CalendarDayCell
                  {...props}
                  day={day}
                  shifts={shifts}
                  isSingleSelected={isSingleSelected}
                  isMultiSelected={isMultiSelected}
                  hasShifts={hasShifts}
                  onClick={() => handleDayClick(day)}
                  onShiftClick={onShiftClick}
                />
              );
            },
          }}
          className="w-full"
          showOutsideDays={true}
        />
      </div>
    </>
  );
};
