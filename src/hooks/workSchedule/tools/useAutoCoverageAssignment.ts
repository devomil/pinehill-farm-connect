
import { useState } from "react";
import { WorkSchedule, WorkShift } from "@/types/workSchedule";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { User } from "@/types";
import { AutoCoverageAssignmentOptions, AutoCoverageAssignmentResult } from "../types/adminScheduleTypes";

export function useAutoCoverageAssignment(
  options: AutoCoverageAssignmentOptions = {}
): AutoCoverageAssignmentResult {
  const { onCoverageAssigned } = options;
  const [loading, setLoading] = useState(false);

  // Auto-assign coverage for gaps in the schedule
  const autoAssignCoverage = async (
    scheduleData: WorkSchedule | null,
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
      
      // Call optional callback
      if (onCoverageAssigned) onCoverageAssigned(newShift);
      
      return newShift;
    } catch (error) {
      console.error("Error auto-assigning coverage:", error);
      toast({
        description: "Failed to auto-assign coverage",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    autoAssignCoverage,
    loading
  };
}
