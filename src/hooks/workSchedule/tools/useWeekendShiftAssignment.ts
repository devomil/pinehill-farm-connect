
import { useState } from "react";
import { WorkSchedule, WorkShift } from "@/types/workSchedule";
import { format, addDays, isSaturday, isSunday } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { WeekendShiftAssignmentOptions, WeekendShiftAssignmentResult } from "../types/adminScheduleTypes";

export function useWeekendShiftAssignment(
  options: WeekendShiftAssignmentOptions = {}
): WeekendShiftAssignmentResult {
  const { onSaveComplete } = options;
  const [loading, setLoading] = useState(false);

  // Assign weekend shifts to an employee
  const assignWeekendShifts = (
    scheduleData: WorkSchedule | null,
    employeeId: string,
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string,
    onSave: (schedule: WorkSchedule) => void
  ) => {
    if (!scheduleData) {
      toast({
        description: "No schedule data available",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      let currentDate = new Date(startDate);
      const shifts: WorkShift[] = [];
      
      while (currentDate <= endDate) {
        if (isSaturday(currentDate) || isSunday(currentDate)) {
          const shift: WorkShift = {
            id: uuidv4(),
            employeeId: employeeId,
            date: format(currentDate, "yyyy-MM-dd"),
            startTime: startTime,
            endTime: endTime,
            isRecurring: false
          };
          
          shifts.push(shift);
        }
        
        currentDate = addDays(currentDate, 1);
      }
      
      if (shifts.length === 0) {
        toast({
          description: "No weekend shifts in the selected date range",
          variant: "destructive"
        });
        return;
      }
      
      // Combine with existing shifts, replacing any on the same days
      const existingShiftsFiltered = scheduleData.shifts.filter(
        existingShift => !shifts.some(newShift => newShift.date === existingShift.date)
      );
      
      const updatedSchedule = {
        ...scheduleData,
        shifts: [...existingShiftsFiltered, ...shifts]
      };
      
      onSave(updatedSchedule);
      
      toast({
        description: `Created ${shifts.length} weekend shifts`,
        variant: "success"
      });
      
      // Call optional callback
      if (onSaveComplete) onSaveComplete();
    } catch (error) {
      console.error("Error assigning weekend shifts:", error);
      toast({
        description: "Failed to assign weekend shifts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    assignWeekendShifts,
    loading
  };
}
