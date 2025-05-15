
import { WorkSchedule } from "@/types/workSchedule";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

interface UseScheduleResetProps {
  employeeId: string | null;
  currentMonth: string;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setScheduleData: (data: WorkSchedule | null) => void;
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
  
  const resetSchedule = async () => {
    if (!employeeId) {
      setError(new Error('No employee selected'));
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, this would be an API call to reset the schedule
      
      // Create a new empty schedule
      const newSchedule: WorkSchedule = {
        id: uuidv4(),
        employeeId,
        month: currentMonth,
        shifts: []
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setScheduleData(newSchedule);
      
      // Update mock store
      updateMockSchedule(employeeId, newSchedule);
      
      // Show success message
      toast({
        description: "Schedule reset successfully",
        variant: "success"
      });
    } catch (err) {
      console.error('Error resetting schedule:', err);
      setError(err instanceof Error ? err : new Error('Failed to reset schedule'));
      toast({
        description: "Failed to reset schedule",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return { resetSchedule };
}
