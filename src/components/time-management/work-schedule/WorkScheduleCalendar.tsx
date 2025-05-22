
import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, addDays, getDay, isSameMonth, isSameDay } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkShift } from "@/types/workSchedule";
import { CalendarNavigation } from "./CalendarNavigation";
import { CalendarDayCell } from "./CalendarDayCell";
import { EmployeeShiftDetailsDialog } from "./EmployeeShiftDetailsDialog";
import { useAuth } from "@/contexts/AuthContext";

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
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  // Return an ordered array of days for the calendar grid
  const calendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = monthStart;
    const endDate = monthEnd;
    
    // Get the starting day of week (0 = Sunday, 1 = Monday, etc.)
    const startDay = getDay(startDate);
    
    // Create array for days in the month + padding days
    const days = [];
    
    // Add days from previous month to start from Sunday or fill the first row
    for (let i = 0; i < startDay; i++) {
      const prevDate = addDays(startDate, -1 * (startDay - i));
      days.push(prevDate);
    }
    
    // Add all days in the current month
    let currentDate = startDate;
    while (currentDate <= endDate) {
      days.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }
    
    // Add days from next month to complete the last row if needed
    const remainingCells = 7 - (days.length % 7);
    if (remainingCells < 7) {
      for (let i = 1; i <= remainingCells; i++) {
        const nextDate = addDays(endDate, i);
        days.push(nextDate);
      }
    }
    
    return days;
  };
  
  const days = calendarDays();
  
  // Handle day click action based on selection mode
  const handleDayClick = (date: Date) => {
    if (selectionMode === "single") {
      setSelectedDate(date);
      if (onDateSelected && isSameMonth(date, currentMonth)) {
        onDateSelected(date);
      }
    } else if (selectionMode === "multiple" && onDayToggle) {
      if (isSameMonth(date, currentMonth)) {
        onDayToggle(date);
      }
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
    if (isAdmin && onDeleteShift) {
      onDeleteShift(shiftId);
      // Close the dialog after deleting
      setIsDialogOpen(false);
    }
  };
  
  const monthTitle = format(currentMonth, "MMMM yyyy");
  
  return (
    <>
      <Card className={hideCalendar ? "hidden" : ""}>
        <CardContent className="p-0">
          <div className="flex justify-between items-center p-2 bg-gray-50">
            <h3 className="text-lg font-medium">{monthTitle}</h3>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentMonth(addDays(startOfMonth(currentMonth), -1))}
                className="h-8 w-8 p-0"
              >
                &lt;
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentMonth(addDays(endOfMonth(currentMonth), 1))}
                className="h-8 w-8 p-0"
              >
                &gt;
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 bg-muted/50">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div
                key={day}
                className="py-2 text-center text-sm font-medium"
              >
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 p-1">
            {days.map((day, i) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const shiftsForDay = shiftsMap.get(dateKey) || [];
              
              return (
                <CalendarDayCell
                  key={i}
                  date={day}
                  shifts={shiftsForDay}
                  isSelected={selectionMode === "single" ? selectedDate ? isSameDay(day, selectedDate) : false : false}
                  outside={!isSameMonth(day, currentMonth)}
                  today={isSameDay(day, new Date())}
                  onClick={() => handleDayClick(day)}
                  onShiftClick={(shift) => handleShiftClick(day, shift)}
                  showEmployeeNames={showEmployeeNames || isAdminView}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {viewingDate && isDialogOpen && (
        <EmployeeShiftDetailsDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          date={viewingDate}
          shifts={shiftsMap.get(format(viewingDate, "yyyy-MM-dd")) || []}
          onDeleteShift={isAdmin ? handleDeleteShift : undefined}
        />
      )}
    </>
  );
};
