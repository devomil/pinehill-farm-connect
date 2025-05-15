
import { useCallback } from "react";
import { WorkSchedule } from "@/types/workSchedule";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

interface UseScheduleResetProps {
  employeeId: string | null;
  currentMonth: string;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setScheduleData: (schedule: WorkSchedule) => void;
  updateMockSchedule: (employeeId: string, schedule: WorkSchedule) => void;
}

export function useScheduleReset({
  employeeId,
  currentMonth,
  setLoading,
  setError,
  setScheduleData,
  updateMockSchedule
}: UseScheduleResetProps) {
  
  // Reset the schedule
  const resetSchedule = useCallback(() => {
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
        // Create empty schedule
        const newSchedule: WorkSchedule = {
          id: uuidv4(),
          employeeId,
          month: currentMonth,
          shifts: []
        };
        
        updateMockSchedule(employeeId, newSchedule);
        
        setScheduleData(newSchedule);
        toast({
          description: "Schedule has been reset",
          variant: "default"
        });
      } catch (err) {
        console.error("Error resetting schedule:", err);
        setError(err instanceof Error ? err : new Error('Failed to reset schedule'));
        toast({
          description: "Error resetting schedule",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }, 500);
  }, [employeeId, currentMonth, setLoading, setError, setScheduleData, updateMockSchedule]);

  return { resetSchedule };
}
