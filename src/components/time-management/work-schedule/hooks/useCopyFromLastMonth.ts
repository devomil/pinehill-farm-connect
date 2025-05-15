
import { useCallback } from "react";
import { WorkSchedule } from "@/types/workSchedule";
import { subMonths, format } from "date-fns";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/hooks/use-toast";

interface UseCopyFromLastMonthProps {
  employeeId: string | null;
  currentMonth: string;
  mockSchedules: Record<string, WorkSchedule>;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setScheduleData: (schedule: WorkSchedule) => void;
  updateMockSchedule: (employeeId: string, schedule: WorkSchedule) => void;
}

export function useCopyFromLastMonth({
  employeeId,
  currentMonth,
  mockSchedules,
  setLoading,
  setError,
  setScheduleData,
  updateMockSchedule
}: UseCopyFromLastMonthProps) {
  
  // Copy from last month
  const copyFromLastMonth = useCallback(() => {
    if (!employeeId) {
      toast({
        description: "No employee selected",
        variant: "destructive"
      });
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
          
          updateMockSchedule(employeeId, newSchedule);
          
          setScheduleData(newSchedule);
          toast({
            description: "Schedule copied from last month",
            variant: "success"
          });
        } else {
          toast({
            description: "No schedule found from last month",
            variant: "default"
          });
        }
      } catch (err) {
        console.error("Error copying from last month:", err);
        setError(err instanceof Error ? err : new Error('Failed to copy from last month'));
        toast({
          description: "Error copying schedule",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }, 700);
  }, [employeeId, currentMonth, mockSchedules, setLoading, setError, setScheduleData, updateMockSchedule]);

  return { copyFromLastMonth };
}
