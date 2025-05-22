
import { WorkSchedule, WorkShift } from "@/types/workSchedule";

/**
 * Builds a map of date strings to arrays of shifts
 */
export function buildShiftsMap(scheduleData: WorkSchedule | null): Map<string, WorkShift[]> {
  const shiftsMap = new Map<string, WorkShift[]>();
  
  if (scheduleData?.shifts) {
    scheduleData.shifts.forEach(shift => {
      const dateKey = shift.date;
      if (!shiftsMap.has(dateKey)) {
        shiftsMap.set(dateKey, []);
      }
      shiftsMap.get(dateKey)!.push(shift);
    });
  }
  
  return shiftsMap;
}
