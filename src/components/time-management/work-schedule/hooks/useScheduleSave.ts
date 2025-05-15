
import { WorkSchedule } from "@/types/workSchedule";
import { toast } from "@/hooks/use-toast";

interface UseScheduleSaveProps {
  employeeId: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setScheduleData: (data: WorkSchedule | null) => void;
  updateMockSchedule: (employeeId: string, schedule: WorkSchedule) => void;
}

export function useScheduleSave({
  employeeId,
  setLoading,
  setError,
  setScheduleData,
  updateMockSchedule
}: UseScheduleSaveProps) {
  
  const saveSchedule = async (schedule: WorkSchedule) => {
    if (!employeeId) {
      setError(new Error('No employee selected'));
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, this would be an API call
      console.log('Saving schedule:', schedule);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setScheduleData(schedule);
      
      // Update mock store
      updateMockSchedule(employeeId, schedule);
      
      // Show success message
      toast({
        description: "Schedule saved successfully",
        variant: "success"
      });
    } catch (err) {
      console.error('Error saving schedule:', err);
      setError(err instanceof Error ? err : new Error('Failed to save schedule'));
      toast({
        description: "Failed to save schedule",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return { saveSchedule };
}
