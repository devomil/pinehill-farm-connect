
import React, { useState } from "react";
import { WorkSchedule } from "@/types/workSchedule";
import { Card, CardContent } from "@/components/ui/card";
import { format, addMonths, subMonths } from "date-fns";
import { EmployeeShiftDetailsDialog } from "./EmployeeShiftDetailsDialog";
import { buildShiftsMap } from "./scheduleHelpers";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { usePrintSchedule } from "@/contexts/timeManagement/hooks";
import { WorkScheduleCalendar } from "./WorkScheduleCalendar";

interface EmployeeScheduleViewProps {
  scheduleData: WorkSchedule | null;
  loading: boolean;
  clickable?: boolean;
  viewAllUrl?: string;
}

export const EmployeeScheduleView: React.FC<EmployeeScheduleViewProps> = ({
  scheduleData,
  loading,
  clickable = false,
  viewAllUrl,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { printSchedule } = usePrintSchedule();
  
  // Create map of dates to shifts
  const shiftsMap = buildShiftsMap(scheduleData);
  
  // Handle day click
  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    const dateStr = format(day, "yyyy-MM-dd");
    const shiftsForDay = shiftsMap.get(dateStr);
    
    if (shiftsForDay && shiftsForDay.length > 0) {
      setIsDialogOpen(true);
    }
  };

  // Handle shift click
  const handleShiftClick = (shift: any) => {
    setSelectedDate(new Date(shift.date));
    setIsDialogOpen(true);
  };

  const handlePrint = () => {
    if (scheduleData) {
      printSchedule(scheduleData, {});
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!scheduleData || scheduleData.shifts.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No schedule available for this month
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePrint}
          className="flex items-center gap-1"
        >
          <Printer className="h-4 w-4" />
          Print Schedule
        </Button>
      </div>
      
      <WorkScheduleCalendar
        currentMonth={currentDate}
        setCurrentMonth={setCurrentDate}
        shiftsMap={shiftsMap}
        selectedDate={selectedDate || undefined}
        setSelectedDate={(date) => setSelectedDate(date || null)}
        onShiftClick={handleShiftClick}
        showEmployeeNames={true}
        title="My Schedule"
      />
      
      {isDialogOpen && selectedDate && (
        <EmployeeShiftDetailsDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          date={selectedDate}
          shifts={shiftsMap.get(format(selectedDate, "yyyy-MM-dd")) || []}
        />
      )}
    </div>
  );
};
