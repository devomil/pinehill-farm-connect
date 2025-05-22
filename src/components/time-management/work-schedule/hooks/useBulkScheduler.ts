
import { useState } from "react";
import { WorkSchedule } from "@/types/workSchedule";
import { uuid } from "@/utils/uuid";
import { toast } from "sonner";

export function useBulkScheduler(
  selectedEmployee: string | null,
  scheduleData: WorkSchedule | null,
  onSave: (schedule: WorkSchedule) => void
) {
  const [bulkMode, setBulkMode] = useState<string | null>(null);
  
  // Standard handler with consistent parameter order (startTime, endTime, days)
  const handleBulkSchedule = (startTime: string, endTime: string, days: string[]) => {
    if (!scheduleData || !selectedEmployee) {
      toast.error("No employee or schedule data available");
      return;
    }
    
    if (days.length === 0) {
      toast.error("No days selected for scheduling");
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
    toast.success(`Added ${newShifts.length} shifts to the schedule`);
  };

  return {
    bulkMode,
    setBulkMode,
    handleBulkSchedule
  };
}
