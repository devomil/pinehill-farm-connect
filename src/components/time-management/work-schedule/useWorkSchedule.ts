
import { useState, useEffect, useCallback } from "react";
import { WorkSchedule } from "@/types/workSchedule";
import { format, subMonths } from "date-fns";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

// This is a mock implementation that would be replaced with actual API calls
export function useWorkSchedule(employeeId: string | null) {
  const [scheduleData, setScheduleData] = useState<WorkSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Current month in YYYY-MM format
  const currentMonth = format(new Date(), "yyyy-MM");
  
  // Mock data store for demo purposes
  const [mockSchedules, setMockSchedules] = useState<Record<string, WorkSchedule>>({});
  
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
        toast.error("Error loading schedule data");
      } finally {
        setLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [employeeId, currentMonth, mockSchedules]);
  
  // Save the schedule
  const saveSchedule = useCallback((schedule: WorkSchedule) => {
    if (!employeeId) {
      toast.error("No employee selected");
      return;
    }
    
    console.log("Saving schedule:", schedule);
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Update mock data store
        setMockSchedules(prev => ({
          ...prev,
          [employeeId]: schedule
        }));
        
        setScheduleData(schedule);
        toast.success("Schedule saved successfully");
      } catch (err) {
        console.error("Error saving schedule:", err);
        setError(err instanceof Error ? err : new Error('Failed to save schedule'));
        toast.error("Error saving schedule");
      } finally {
        setLoading(false);
      }
    }, 500);
  }, [employeeId]);
  
  // Reset the schedule
  const resetSchedule = useCallback(() => {
    if (!employeeId) {
      toast.error("No employee selected");
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Create empty schedule
        const newSchedule: WorkSchedule = {
          id: uuidv4(),
          employeeId,
          month: currentMonth,
          shifts: []
        };
        
        setMockSchedules(prev => ({
          ...prev,
          [employeeId]: newSchedule
        }));
        
        setScheduleData(newSchedule);
        toast.info("Schedule has been reset");
      } catch (err) {
        console.error("Error resetting schedule:", err);
        setError(err instanceof Error ? err : new Error('Failed to reset schedule'));
        toast.error("Error resetting schedule");
      } finally {
        setLoading(false);
      }
    }, 500);
  }, [employeeId, currentMonth]);
  
  // Copy from last month
  const copyFromLastMonth = useCallback(() => {
    if (!employeeId) {
      toast.error("No employee selected");
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        const lastMonth = format(subMonths(new Date(), 1), "yyyy-MM");
        const lastMonthSchedule = mockSchedules[`${employeeId}-${lastMonth}`];
        
        if (lastMonthSchedule && lastMonthSchedule.shifts && lastMonthSchedule.shifts.length > 0) {
          // Copy shifts but adjust dates to current month
          const currentMonthDate = new Date();
          const lastMonthDate = subMonths(new Date(), 1);
          
          const yearDiff = currentMonthDate.getFullYear() - lastMonthDate.getFullYear();
          const monthDiff = currentMonthDate.getMonth() - lastMonthDate.getMonth() + (yearDiff * 12);
          
          const adjustedShifts = lastMonthSchedule.shifts.map(shift => {
            const originalDate = new Date(shift.date);
            originalDate.setMonth(originalDate.getMonth() + monthDiff);
            
            return {
              ...shift,
              id: uuidv4(), // Generate new IDs
              date: format(originalDate, "yyyy-MM-dd")
            };
          });
          
          const newSchedule: WorkSchedule = {
            id: uuidv4(),
            employeeId,
            month: currentMonth,
            shifts: adjustedShifts
          };
          
          setMockSchedules(prev => ({
            ...prev,
            [employeeId]: newSchedule
          }));
          
          setScheduleData(newSchedule);
          toast.success("Schedule copied from last month");
        } else {
          toast.info("No schedule found from last month");
        }
      } catch (err) {
        console.error("Error copying from last month:", err);
        setError(err instanceof Error ? err : new Error('Failed to copy from last month'));
        toast.error("Error copying schedule");
      } finally {
        setLoading(false);
      }
    }, 700);
  }, [employeeId, currentMonth, mockSchedules]);
  
  return {
    scheduleData,
    loading,
    error,
    saveSchedule,
    resetSchedule,
    copyFromLastMonth
  };
}
