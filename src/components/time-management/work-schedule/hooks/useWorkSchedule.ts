
import { WorkSchedule } from "@/types/workSchedule";
import { useWorkScheduleData } from "./useWorkScheduleData";
import { useScheduleSave } from "./useScheduleSave";
import { useScheduleReset } from "./useScheduleReset";
import { useCopyFromLastMonth } from "./useCopyFromLastMonth";

// This is the main hook that composes all the other hooks
export function useWorkSchedule(employeeId: string | null) {
  const {
    scheduleData,
    setScheduleData,
    loading,
    setLoading,
    error,
    setError,
    currentMonth,
    mockSchedules,
    updateMockSchedule
  } = useWorkScheduleData(employeeId);
  
  const { saveSchedule } = useScheduleSave({
    employeeId,
    setLoading,
    setError,
    setScheduleData,
    updateMockSchedule
  });
  
  const { resetSchedule } = useScheduleReset({
    employeeId,
    currentMonth,
    setLoading,
    setError,
    setScheduleData,
    updateMockSchedule
  });
  
  const { copyFromLastMonth } = useCopyFromLastMonth({
    employeeId,
    currentMonth,
    mockSchedules,
    setLoading,
    setError,
    setScheduleData,
    updateMockSchedule
  });

  return {
    scheduleData,
    loading,
    error,
    saveSchedule,
    resetSchedule,
    copyFromLastMonth
  };
}
