
import { useState } from "react";
import { WorkSchedule } from "@/types/workSchedule";
import { uuid } from "@/utils/uuid";
import { toast } from "@/hooks/use-toast";

export function useBulkScheduler(
  selectedEmployee: string | null,
  scheduleData: WorkSchedule | null,
  onSave: (schedule: WorkSchedule) => void
) {
  const [bulkMode, setBulkMode] = useState<string | null>(null);
  
  // Handle bulk scheduling (for either bulk mode or specific days)
  const handleBulkSchedule = (days: string[], startTime: string, endTime: string) => {
    if (!scheduleData || !selectedEmployee) {
      toast({
        description: "No employee or schedule data available",
        variant: "destructive"
      });
      return;
    }
    
    if (days.length === 0) {
      toast({
        description: "No days selected for scheduling",
        variant: "destructive"
      });
      return;
    }
    
    console.log(`Bulk scheduling for ${days.length} days, employee: ${selectedEmployee}`);
    console.log("Days to schedule:", days);
    
    // Create new shifts for the selected days
    const newShifts = days.map(day => {
      const [year, month, dayOfMonth] = day.split('-').map(Number);
      const shiftDate = new Date(year, month - 1, dayOfMonth);
      
      return {
        id: uuid(),
        employeeId: selectedEmployee,
        date: day,
        startTime,
        endTime,
        isRecurring: false,
      };
    });
    
    console.log(`Created ${newShifts.length} new shifts`);
    
    // Remove any existing shifts on these days
    const existingShiftsFiltered = scheduleData.shifts.filter(
      shift => !days.includes(shift.date)
    );
    
    const updatedSchedule = {
      ...scheduleData,
      shifts: [...existingShiftsFiltered, ...newShifts],
    };
    
    console.log("Saving updated schedule with new shifts:", updatedSchedule);
    
    // Save the updated schedule and show feedback
    onSave(updatedSchedule);
    toast({
      description: `Added ${newShifts.length} shifts to the schedule`,
      variant: "success"
    });
  };

  return {
    bulkMode,
    setBulkMode,
    handleBulkSchedule
  };
}
