
import { useCallback } from "react";
import { WorkSchedule } from "@/types/workSchedule";
import { toast } from "@/hooks/use-toast";

interface UseScheduleSaveProps {
  employeeId: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setScheduleData: (schedule: WorkSchedule) => void;
  updateMockSchedule: (employeeId: string, schedule: WorkSchedule) => void;
}

export function useScheduleSave({
  employeeId,
  setLoading,
  setError,
  setScheduleData,
  updateMockSchedule
}: UseScheduleSaveProps) {
  
  // Save the schedule
  const saveSchedule = useCallback((schedule: WorkSchedule) => {
    if (!employeeId) {
      toast({
        description: "No employee selected",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Saving schedule:", schedule);
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Update mock data store
        updateMockSchedule(employeeId, schedule);
        
        setScheduleData(schedule);
        toast({
          description: "Schedule saved successfully",
          variant: "success"
        });
      } catch (err) {
        console.error("Error saving schedule:", err);
        setError(err instanceof Error ? err : new Error('Failed to save schedule'));
        toast({
          description: "Error saving schedule",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }, 500);
  }, [employeeId, setLoading, setError, setScheduleData, updateMockSchedule]);

  return { saveSchedule };
}
