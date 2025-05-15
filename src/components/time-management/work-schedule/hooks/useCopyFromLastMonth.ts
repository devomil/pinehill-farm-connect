import { WorkSchedule } from "@/types/workSchedule";
import { toast } from "@/hooks/use-toast";
import { addMonths, format, parse } from "date-fns";

interface UseCopyFromLastMonthProps {
  employeeId: string | null;
  currentMonth: string;
  mockSchedules: Record<string, WorkSchedule>;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setScheduleData: (data: WorkSchedule | null) => void;
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
  
  const copyFromLastMonth = async () => {
    if (!employeeId) {
      setError(new Error('No employee selected'));
      return;
    }
    
    setLoading(true);
    
    try {
      // Get the current schedule
      const currentSchedule = mockSchedules[employeeId];
      
      if (!currentSchedule) {
        throw new Error("No current schedule found");
      }
      
      // Calculate last month's date
      const currentDate = parse(currentMonth, "yyyy-MM", new Date());
      const lastMonthDate = addMonths(currentDate, -1);
      const lastMonth = format(lastMonthDate, "yyyy-MM");
      
      // In a real app, this would be an API call to get last month's schedule
      // For demo, we'll create a copy with adjusted dates
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Look for last month's schedule in the mock store
      const existingSchedules = Object.values(mockSchedules);
      const lastMonthSchedule = existingSchedules.find(
        schedule => schedule.employeeId === employeeId && schedule.month === lastMonth
      );
      
      if (!lastMonthSchedule || lastMonthSchedule.shifts.length === 0) {
        toast({
          description: "No shifts found from last month to copy",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Adjust the dates from last month to this month
      const currentYear = currentDate.getFullYear();
      const currentMonthNum = currentDate.getMonth();
      
      const adjustedShifts = lastMonthSchedule.shifts.map(shift => {
        // Parse the original date
        const originalDate = parse(shift.date, "yyyy-MM-dd", new Date());
        
        // Keep the same day of month but use current month/year
        const newDate = new Date(currentYear, currentMonthNum, originalDate.getDate());
        
        // Format back to string
        const newDateStr = format(newDate, "yyyy-MM-dd");
        
        return {
          ...shift,
          date: newDateStr
        };
      });
      
      // Create the updated schedule
      const updatedSchedule: WorkSchedule = {
        ...currentSchedule,
        shifts: adjustedShifts
      };
      
      // Update local state
      setScheduleData(updatedSchedule);
      
      // Update mock store
      updateMockSchedule(employeeId, updatedSchedule);
      
      // Show success message
      toast({
        description: `Copied ${adjustedShifts.length} shifts from last month`,
        variant: "success"
      });
    } catch (err) {
      console.error('Error copying from last month:', err);
      setError(err instanceof Error ? err : new Error('Failed to copy from last month'));
      toast({
        description: "Failed to copy shifts from last month",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return { copyFromLastMonth };
}
