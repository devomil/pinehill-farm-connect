
import { useState } from "react";
import { WorkSchedule, WorkShift } from "@/types/workSchedule";
import { format, addDays, getDay } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

export function useWeekdayShiftAssignment() {
  const [loading, setLoading] = useState(false);

  // Assign weekday shifts to an employee
  const assignWeekdayShifts = (
    scheduleData: WorkSchedule | null,
    employeeId: string, 
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string,
    daysToInclude: number[], // 0 = Sunday, 1 = Monday, etc.
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
        const dayOfWeek = getDay(currentDate);
        
        if (daysToInclude.includes(dayOfWeek)) {
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
          description: "No shifts created - check your day selection",
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
        description: `Created ${shifts.length} weekday shifts`,
        variant: "success"
      });
    } catch (error) {
      console.error("Error assigning weekday shifts:", error);
      toast({
        description: "Failed to assign weekday shifts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    assignWeekdayShifts,
    loading
  };
}
