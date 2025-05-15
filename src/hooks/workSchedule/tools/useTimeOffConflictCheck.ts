
import { useState } from "react";
import { WorkShift } from "@/types/workSchedule";
import { toast } from "@/hooks/use-toast";

export function useTimeOffConflictCheck() {
  const [loading, setLoading] = useState(false);

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

  return {
    checkTimeOffConflicts,
    loading
  };
}
