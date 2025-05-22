
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, isValid } from "date-fns";
import { WorkSchedule, WorkShift } from "@/types/workSchedule";
import { toast } from "@/hooks/use-toast";
import { User } from "@/types";
import {
  ShiftTimesSelector,
  WeekdaySelector,
  SpecificDaySelector,
  ActionButtons
} from "./admin-tools";

interface AdminSchedulingToolsBarProps {
  selectedEmployee: string;
  currentMonth: Date;
  scheduleData: WorkSchedule | null;
  availableEmployees: User[];
  onAssignWeekday: (
    employeeId: string,
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string,
    daysToInclude: number[]
  ) => void;
  onAssignWeekend: (
    employeeId: string,
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string
  ) => void;
  onCheckConflicts: (
    employeeId: string,
    shifts: WorkShift[]
  ) => Promise<string[]>;
  onAutoAssignCoverage: (
    gapDate: string,
    startTime: string,
    endTime: string,
    availableEmployees: User[]
  ) => Promise<WorkShift | null>;
  onAddSpecificDayShift?: (
    employeeId: string,
    date: Date,
    startTime: string,
    endTime: string
  ) => void;
}

export const AdminSchedulingToolsBar: React.FC<AdminSchedulingToolsBarProps> = ({
  selectedEmployee,
  currentMonth,
  scheduleData,
  availableEmployees,
  onAssignWeekday,
  onAssignWeekend,
  onCheckConflicts,
  onAutoAssignCoverage,
  onAddSpecificDayShift
}) => {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Month range for scheduling
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const toggleDay = (day: number) => {
    setSelectedDays(current => {
      if (current.includes(day)) {
        return current.filter(d => d !== day);
      } else {
        return [...current, day];
      }
    });
  };
  
  const handleAssignWeekday = () => {
    if (!selectedDays.length) {
      toast({
        description: "Please select at least one weekday",
        variant: "destructive"
      });
      return;
    }
    
    onAssignWeekday(
      selectedEmployee,
      monthStart,
      monthEnd,
      startTime,
      endTime,
      selectedDays
    );
  };
  
  const handleAssignWeekend = () => {
    onAssignWeekend(
      selectedEmployee,
      monthStart,
      monthEnd,
      startTime,
      endTime
    );
  };
  
  const handleCheckConflicts = async () => {
    if (!scheduleData) {
      toast({
        description: "No schedule data available",
        variant: "destructive"
      });
      return;
    }
    
    const conflicts = await onCheckConflicts(selectedEmployee, scheduleData.shifts);
    
    if (conflicts.length === 0) {
      toast({
        description: "No time-off conflicts found in the schedule",
        variant: "success"
      });
    }
  };
  
  const handleAutoAssignCoverage = async () => {
    // For demo purposes, we'll just use the current date
    const today = format(new Date(), "yyyy-MM-dd");
    
    const result = await onAutoAssignCoverage(
      today,
      startTime,
      endTime,
      availableEmployees.filter(emp => emp.id !== selectedEmployee)
    );
    
    if (result) {
      toast({
        description: "Coverage auto-assigned successfully",
        variant: "success"
      });
    }
  };
  
  const handleAddSpecificDayShift = () => {
    if (!selectedDate || !isValid(selectedDate)) {
      toast({
        description: "Please select a specific day",
        variant: "destructive"
      });
      return;
    }

    if (onAddSpecificDayShift) {
      onAddSpecificDayShift(
        selectedEmployee,
        selectedDate,
        startTime,
        endTime
      );
      
      toast({
        description: `Shift added for ${format(selectedDate, "MMMM d, yyyy")}`,
        variant: "success"
      });
      
      // Reset the selected date after adding
      setSelectedDate(undefined);
    }
  };
  
  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-medium">Admin Scheduling Tools</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShiftTimesSelector 
          startTime={startTime}
          endTime={endTime}
          setStartTime={setStartTime}
          setEndTime={setEndTime}
        />
        
        <WeekdaySelector 
          selectedDays={selectedDays} 
          toggleDay={toggleDay} 
        />
      </div>
      
      <SpecificDaySelector 
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        currentMonth={currentMonth}
        onAddShift={handleAddSpecificDayShift}
      />
      
      <ActionButtons 
        onAssignWeekday={handleAssignWeekday}
        onAssignWeekend={handleAssignWeekend}
        onCheckConflicts={handleCheckConflicts}
        onAutoAssignCoverage={handleAutoAssignCoverage}
      />
    </Card>
  );
};
