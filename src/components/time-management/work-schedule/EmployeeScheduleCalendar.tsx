
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { WorkShift } from "@/types/workSchedule";

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
  // Ensure current date is valid
  const safeCurrentDate = isValid(currentDate) ? currentDate : new Date();
  
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
      console.warn("Invalid day in renderDayContent");
      return <div className="h-full w-full"></div>;
    }
    
    const dateStr = safeFormat(day, "yyyy-MM-dd");
    const shifts = shiftsMap.get(dateStr) || [];
    
    return (
      <div className="h-full w-full">
        <div className="text-right text-xs">{safeFormat(day, "d")}</div>
        {shifts.length > 0 && (
          <div className="mt-1 bg-primary/10 text-xs p-1 rounded">
            {shifts.map((shift, index) => (
              <div key={index} className="truncate">
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
    
    return {
      "bg-primary/5": hasShifts,
      "cursor-pointer hover:bg-accent": hasShifts
    };
  };

  // Handle day click with validation
  const handleDayClick = (day: Date) => {
    if (isValid(day)) {
      onDayClick(day);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={onPreviousMonth} size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <h3 className="font-semibold">{safeFormat(safeCurrentDate, "MMMM yyyy")}</h3>
        <Button variant="ghost" onClick={onNextMonth} size="sm">
          Next <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="border rounded-lg p-2">
        <Calendar
          mode="default"
          month={safeCurrentDate}
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
    </div>
  );
};
