
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { WorkShift } from "@/types/workSchedule";
import { CalendarNavigation } from "./CalendarNavigation";
import { format, isEqual } from "date-fns";
import { CalendarDayCell } from "./CalendarDayCell";

interface WorkScheduleCalendarProps {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  shiftsMap: Map<string, WorkShift[]>;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  onDateSelected?: (date: Date | undefined) => void;
  onShiftClick?: (shift: WorkShift) => void;
  selectionMode?: "single" | "multiple";
  isDaySelected?: (date: Date) => boolean;
  onDayToggle?: (date: Date) => void;
  selectedCount?: number;
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
  onDayToggle,
  selectedCount = 0
}) => {
  const [highlightedDates, setHighlightedDates] = useState<Date[]>([]);
  
  // Format dates from shiftsMap to be displayed
  useEffect(() => {
    const dates: Date[] = [];
    shiftsMap.forEach((shifts, dateStr) => {
      if (shifts.length > 0) {
        const [year, month, day] = dateStr.split('-').map(Number);
        dates.push(new Date(year, month - 1, day));
      }
    });
    setHighlightedDates(dates);
  }, [shiftsMap]);
  
  // Handle date selection based on mode
  const handleDateSelect = (date: Date | undefined) => {
    // In multiple selection mode, toggle day selection
    if (selectionMode === "multiple" && onDayToggle && date) {
      onDayToggle(date);
      return;
    }
    
    // In single selection mode, update selected date
    if (selectionMode === "single") {
      setSelectedDate(date);
      if (onDateSelected && date) {
        onDateSelected(date);
      }
    }
  };
  
  // Create a common Day component renderer for both calendar modes
  const DayComponent = (props: any) => {
    const date = props.date;
    const dateKey = format(date, 'yyyy-MM-dd');
    const shifts = shiftsMap.get(dateKey) || [];
    const isSelected = selectionMode === "multiple" && isDaySelected ? 
      isDaySelected(date) : 
      selectedDate ? isEqual(date, selectedDate) : false;
    
    return (
      <CalendarDayCell
        {...props}
        shifts={shifts}
        isSelected={isSelected}
        selectionMode={selectionMode}
        onShiftClick={onShiftClick}
        onSelect={() => {
          // In multiple selection mode
          if (selectionMode === "multiple" && onDayToggle) {
            onDayToggle(date);
          } 
          // In single selection mode
          else {
            handleDateSelect(date);
          }
        }}
      />
    );
  };
  
  return (
    <Card className="mb-6">
      <div className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Work Schedule {format(currentMonth, "MMMM yyyy")}
          </h2>
          <CalendarNavigation
            currentMonth={currentMonth}
            onPreviousMonth={() => {
              const newDate = new Date(currentMonth);
              newDate.setMonth(currentMonth.getMonth() - 1);
              setCurrentMonth(newDate);
            }}
            onNextMonth={() => {
              const newDate = new Date(currentMonth);
              newDate.setMonth(currentMonth.getMonth() + 1);
              setCurrentMonth(newDate);
            }}
          />
        </div>
        
        <div className="border rounded-md">
          {selectionMode === "single" ? (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              className="rounded-md border"
              components={{
                Day: DayComponent
              }}
            />
          ) : (
            <Calendar
              mode="multiple"
              selected={highlightedDates}
              onSelect={handleDateSelect}
              month={currentMonth}
              className="rounded-md border"
              components={{
                Day: DayComponent
              }}
            />
          )}
        </div>
      </div>
    </Card>
  );
};
