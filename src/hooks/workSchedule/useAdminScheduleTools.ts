
import { useState } from "react";
import { WorkSchedule, WorkShift } from "@/types/workSchedule";
import { format, addDays, getDay, isSaturday, isSunday } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { User } from "@/types";

export function useAdminScheduleTools(
  scheduleData: WorkSchedule | null,
  onSave: (schedule: WorkSchedule) => void
) {
  const [loading, setLoading] = useState(false);

  // Assign weekday shifts to an employee
  const assignWeekdayShifts = (
    employeeId: string, 
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string,
    daysToInclude: number[] // 0 = Sunday, 1 = Monday, etc.
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
  
  // Assign weekend shifts to an employee
  const assignWeekendShifts = (
    employeeId: string,
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string
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
  
  // Check for schedule conflicts with time-off requests
  const checkTimeOffConflicts = async (
    employeeId: string,
    shifts: WorkShift[]
  ) => {
    try {
      setLoading(true);
      
      // In a real implementation, fetch time-off requests for the employee
      // For demo, we'll simulate a check
      
      // Extract the dates from the shifts
      const shiftDates = shifts.map(shift => shift.date);
      
      // Simulate finding conflicts
      const simulateConflicts = shiftDates.filter(
        (_, index) => index % 5 === 0 // Every 5th shift has a conflict for demo
      );
      
      setLoading(false);
      
      if (simulateConflicts.length > 0) {
        toast({
          description: `Warning: ${simulateConflicts.length} shifts conflict with approved time-off`,
          variant: "warning"
        });
        return simulateConflicts;
      }
      
      return [];
    } catch (error) {
      console.error("Error checking time-off conflicts:", error);
      setLoading(false);
      return [];
    }
  };
  
  // Auto-assign coverage for gaps in the schedule
  const autoAssignCoverage = async (
    gapDate: string,
    startTime: string,
    endTime: string,
    availableEmployees: User[]
  ) => {
    if (!scheduleData || availableEmployees.length === 0) {
      toast({
        description: "No schedule data or available employees",
        variant: "destructive"
      });
      return null;
    }
    
    setLoading(true);
    
    try {
      // In a real implementation, find employees who:
      // 1. Don't have time off for this day
      // 2. Don't already have shifts during this time
      // 3. Haven't exceeded maximum weekly hours
      
      // For demo, just pick a random employee
      const randomIndex = Math.floor(Math.random() * availableEmployees.length);
      const selectedEmployee = availableEmployees[randomIndex];
      
      if (!selectedEmployee) {
        throw new Error("Could not find an employee for coverage");
      }
      
      // Create a new shift for the selected employee
      const newShift: WorkShift = {
        id: uuidv4(),
        employeeId: selectedEmployee.id,
        date: gapDate,
        startTime: startTime,
        endTime: endTime,
        isRecurring: false,
        notes: 'Auto-assigned for coverage'
      };
      
      toast({
        description: `Auto-assigned ${selectedEmployee.name || selectedEmployee.id} for coverage on ${gapDate}`,
        variant: "success"
      });
      
      setLoading(false);
      return newShift;
    } catch (error) {
      console.error("Error auto-assigning coverage:", error);
      toast({
        description: "Failed to auto-assign coverage",
        variant: "destructive"
      });
      setLoading(false);
      return null;
    }
  };

  return {
    assignWeekdayShifts,
    assignWeekendShifts,
    checkTimeOffConflicts,
    autoAssignCoverage,
    loading
  };
}
