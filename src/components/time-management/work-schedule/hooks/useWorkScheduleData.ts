
import { useState, useEffect } from "react";
import { WorkSchedule } from "@/types/workSchedule";
import { v4 as uuidv4 } from 'uuid';
import { format } from "date-fns";
import { toast } from "sonner";
import { globalMockScheduleStore, getMockScheduleForEmployee } from "../scheduleHelpers";

export function useWorkScheduleData(employeeId: string | null) {
  const [scheduleData, setScheduleData] = useState<WorkSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Current month in YYYY-MM format
  const currentMonth = format(new Date(), "yyyy-MM");
  
  // Fetch employee schedule
  useEffect(() => {
    if (!employeeId) {
      setScheduleData(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Simulate API call with setTimeout
    const timeoutId = setTimeout(() => {
      try {
        // Get schedule from the global store
        const existingSchedule = globalMockScheduleStore[employeeId];
        
        if (existingSchedule && existingSchedule.month === currentMonth) {
          console.log("Found existing schedule in global store:", existingSchedule);
          setScheduleData(existingSchedule);
        } else {
          // Create empty schedule for the month
          const newSchedule = getMockScheduleForEmployee(employeeId, currentMonth);
          
          console.log("Creating new schedule:", newSchedule);
          setScheduleData(newSchedule);
        }
      } catch (err) {
        console.error("Error loading schedule data:", err);
        setError(err instanceof Error ? err : new Error('Failed to fetch schedule'));
        toast("Error loading schedule data");
      } finally {
        setLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [employeeId, currentMonth]);

  // Update the schedule in the mock store
  const updateMockSchedule = (employeeId: string, schedule: WorkSchedule) => {
    globalMockScheduleStore[employeeId] = schedule;
    console.log("Updated mock schedule in global store:", schedule);
  };

  return {
    scheduleData,
    setScheduleData,
    loading,
    setLoading,
    error,
    setError,
    currentMonth,
    mockSchedules: globalMockScheduleStore,
    updateMockSchedule
  };
}
