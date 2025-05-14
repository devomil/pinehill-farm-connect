
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { WorkShift } from "@/types/workSchedule";

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
  
  // Handle day click
  const handleDayClick = (day: Date | undefined) => {
    if (!day || !isValid(day)) return;
    
    if (selectionMode === "multiple" && onDayToggle) {
      onDayToggle(day);
    } else {
      setSelectedDate(day);
      onDateSelected();
    }
  };
  
  // Safe format function that checks validity
  const safeFormat = (date: Date, formatString: string): string => {
    try {
      return isValid(date) ? format(date, formatString) : "";
    } catch (e) {
      console.error("Invalid date format:", e);
      return "";
    }
  };
  
  // Render day content function
  const renderDayContent = (day: Date) => {
    if (!isValid(day)) {
      console.warn("Invalid date in renderDayContent");
      return <div className="h-full w-full"></div>;
    }
    
    const dateStr = safeFormat(day, "yyyy-MM-dd");
    const shifts = shiftsMap.get(dateStr) || [];
    
    return (
      <div className="h-full w-full">
        <div className="text-right text-xs">{safeFormat(day, "d")}</div>
        {shifts.length > 0 && (
          <div className="mt-1">
            {shifts.map((shift, index) => (
              <div 
                key={shift.id}
                className="bg-primary/10 text-xs p-1 rounded mt-1 cursor-pointer hover:bg-primary/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onShiftClick(shift);
                }}
              >
                {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Get classes for each day in the calendar
  const getDayClass = (day: Date) => {
    if (!isValid(day)) return {};
    
    const dateStr = safeFormat(day, "yyyy-MM-dd");
    const hasShifts = shiftsMap.has(dateStr);
    
    // Check if this date is selected in single mode
    const isSingleSelected = selectionMode === "single" && selectedDate && isValid(selectedDate) && 
      day.getDate() === selectedDate.getDate() && 
      day.getMonth() === selectedDate.getMonth() && 
      day.getFullYear() === selectedDate.getFullYear();
    
    // Check if this date is selected in multiple mode
    const isMultiSelected = selectionMode === "multiple" && isDaySelected && isDaySelected(day);
    
    return {
      "bg-primary/5": hasShifts,
      "ring-2 ring-primary": isSingleSelected,
      "bg-primary/20": isMultiSelected && !isSingleSelected,
      "cursor-pointer hover:bg-accent": true
    };
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={handlePreviousMonth} size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <h3 className="font-semibold">{safeFormat(safeCurrentMonth, "MMMM yyyy")}</h3>
        <Button variant="ghost" onClick={handleNextMonth} size="sm">
          Next <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="border rounded-lg p-2">
        <Calendar
          mode="default"
          month={safeCurrentMonth}
          onDayClick={handleDayClick}
          components={{
            Day: ({ day, ...props }: any) => {
              if (!day || !isValid(day)) {
                console.warn("Invalid day in Calendar component");
                return null;
              }
              
              return (
                <div
                  {...props}
                  className={`h-20 w-full border rounded-md p-1 ${
                    Object.entries(getDayClass(day))
                      .filter(([, value]) => value)
                      .map(([className]) => className)
                      .join(" ")
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  {renderDayContent(day)}
                </div>
              );
            },
          }}
          className="w-full"
        />
      </div>
    </>
  );
};
