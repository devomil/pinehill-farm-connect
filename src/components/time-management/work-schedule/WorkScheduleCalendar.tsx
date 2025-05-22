
import React, { useState } from "react";
import { format, addDays, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { WorkShift } from "@/types/workSchedule";
import { EmployeeShiftDetailsDialog } from "./EmployeeShiftDetailsDialog";
import { CalendarDaysGrid } from "./calendar/CalendarDaysGrid";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { generateCalendarDays } from "./calendar/calendarUtils";

interface WorkScheduleCalendarProps {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  shiftsMap: Map<string, WorkShift[]>;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  onDateSelected?: (date: Date) => void;
  onShiftClick?: (shift: WorkShift) => void;
  selectionMode?: "single" | "multiple" | "range";
  isDaySelected?: (date: Date) => boolean;
  onDayToggle?: (date: Date) => void;
  selectedCount?: number;
  hideCalendar?: boolean;
  onDeleteShift?: (shiftId: string) => void;
  isAdminView?: boolean;
  showEmployeeNames?: boolean;
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
  selectedCount = 0,
  hideCalendar = false,
  onDeleteShift,
  isAdminView = false,
  showEmployeeNames = false,
}) => {
  const [viewingDate, setViewingDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Generate calendar days array
  const days = generateCalendarDays(currentMonth);
  
  // Handle day click action based on selection mode
  const handleDayClick = (date: Date) => {
    if (selectionMode === "single") {
      setSelectedDate(date);
      if (onDateSelected) {
        onDateSelected(date);
      }
    } else if (selectionMode === "multiple" && onDayToggle) {
      onDayToggle(date);
    }
  };
  
  // Handle clicking on a shift indicator
  const handleShiftClick = (date: Date, shift: WorkShift) => {
    if (onShiftClick) {
      onShiftClick(shift);
    } else {
      // Open the shift details dialog
      setViewingDate(date);
      setIsDialogOpen(true);
    }
  };

  // Handle deleting a shift
  const handleDeleteShift = (shiftId: string) => {
    if (isAdminView && onDeleteShift) {
      onDeleteShift(shiftId);
      // Close the dialog after deleting
      setIsDialogOpen(false);
    }
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(addDays(startOfMonth(currentMonth), -1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(addDays(endOfMonth(currentMonth), 1));
  };
  
  return (
    <>
      <Card className={hideCalendar ? "hidden" : ""}>
        <CardContent className="p-0">
          <CalendarHeader 
            currentMonth={currentMonth}
            onPrevMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
          />
          
          <CalendarDaysGrid 
            days={days}
            currentMonth={currentMonth}
            shiftsMap={shiftsMap}
            selectedDate={selectedDate}
            onDayClick={handleDayClick}
            onShiftClick={handleShiftClick}
            showEmployeeNames={showEmployeeNames}
          />
        </CardContent>
      </Card>
      
      {viewingDate && isDialogOpen && (
        <EmployeeShiftDetailsDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          date={viewingDate}
          shifts={shiftsMap.get(format(viewingDate, "yyyy-MM-dd")) || []}
          onDeleteShift={isAdminView ? handleDeleteShift : undefined}
        />
      )}
    </>
  );
};
