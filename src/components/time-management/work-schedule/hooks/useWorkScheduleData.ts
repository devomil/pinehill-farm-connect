
import { useState, useEffect } from "react";
import { WorkSchedule } from "@/types/workSchedule";
import { v4 as uuidv4 } from 'uuid';
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

// Mock data store (moved from useWorkSchedule)
const mockScheduleStore: Record<string, WorkSchedule> = {};

export function useWorkScheduleData(employeeId: string | null) {
  const [scheduleData, setScheduleData] = useState<WorkSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Current month in YYYY-MM format
  const currentMonth = format(new Date(), "yyyy-MM");
  
  // Mock data store for demo purposes
  const [mockSchedules, setMockSchedules] = useState<Record<string, WorkSchedule>>(mockScheduleStore);
  
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
        // In a real app, this would be an API call
        const existingSchedule = mockSchedules[employeeId];
        
        if (existingSchedule && existingSchedule.month === currentMonth) {
          console.log("Found existing schedule:", existingSchedule);
          setScheduleData(existingSchedule);
        } else {
          // Create empty schedule for the month
          const newSchedule: WorkSchedule = {
            id: uuidv4(),
            employeeId,
            month: currentMonth,
            shifts: []
          };
          
          console.log("Creating new schedule:", newSchedule);
          setScheduleData(newSchedule);
          setMockSchedules(prev => ({
            ...prev,
            [employeeId]: newSchedule
          }));
        }
      } catch (err) {
        console.error("Error loading schedule data:", err);
        setError(err instanceof Error ? err : new Error('Failed to fetch schedule'));
        toast({
          description: "Error loading schedule data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [employeeId, currentMonth, mockSchedules]);

  // Update the schedule in the mock store
  const updateMockSchedule = (employeeId: string, schedule: WorkSchedule) => {
    setMockSchedules(prev => ({
      ...prev,
      [employeeId]: schedule
    }));
    
    // Also update the global store for persistence between hook instances
    Object.assign(mockScheduleStore, {
      [employeeId]: schedule
    });
  };

  return {
    scheduleData,
    setScheduleData,
    loading,
    setLoading,
    error,
    setError,
    currentMonth,
    mockSchedules,
    updateMockSchedule
  };
}
