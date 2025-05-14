
import React, { useMemo, useState } from "react";
import { WorkSchedule } from "@/types/workSchedule";
import { format } from "date-fns";
import { EmployeeScheduleCalendar } from "./EmployeeScheduleCalendar";
import { EmployeeShiftDetailsDialog } from "./EmployeeShiftDetailsDialog";
import { createShiftsMap } from "./employeeScheduleUtils";

interface EmployeeScheduleViewProps {
  scheduleData: WorkSchedule | null;
  loading: boolean;
}

export const EmployeeScheduleView: React.FC<EmployeeScheduleViewProps> = ({
  scheduleData,
  loading
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  
  // Get shifts for each day
  const shiftsMap = useMemo(() => {
    return createShiftsMap(scheduleData);
  }, [scheduleData]);
  
  // Handle day click to view details
  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    
    const dateStr = format(day, "yyyy-MM-dd");
    const existingShifts = shiftsMap.get(dateStr) || [];
    
    if (existingShifts.length > 0) {
      setIsDialogOpen(true);
    }
  };
  
  // Navigate between months
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  if (loading) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Loading your schedule...
      </div>
    );
  }
  
  if (!scheduleData || !scheduleData.shifts || scheduleData.shifts.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No schedule has been set for this month
      </div>
    );
  }
  
  // Get shifts for the selected date
  const selectedDateShifts = selectedDate 
    ? shiftsMap.get(format(selectedDate, "yyyy-MM-dd")) || [] 
    : [];
  
  return (
    <div className="space-y-4">
      <EmployeeScheduleCalendar
        currentDate={currentDate}
        shiftsMap={shiftsMap}
        onDayClick={handleDayClick}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
      />
      
      <EmployeeShiftDetailsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        selectedDate={selectedDate}
        shifts={selectedDateShifts}
      />
    </div>
  );
};
