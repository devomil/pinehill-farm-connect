
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { WorkShift, WorkSchedule } from "@/types/workSchedule";

// Create a map of dates to shifts
export function createShiftsMap(scheduleData: WorkSchedule | null): Map<string, WorkShift[]> {
  if (!scheduleData || !scheduleData.shifts) return new Map();
  
  const map = new Map<string, WorkShift[]>();
  scheduleData.shifts.forEach(shift => {
    const shiftDate = parse(shift.date, "yyyy-MM-dd", new Date());
    const dateKey = format(shiftDate, "yyyy-MM-dd");
    if (!map.has(dateKey)) {
      map.set(dateKey, []);
    }
    map.get(dateKey)!.push(shift);
  });
  return map;
}

// Get all days in the current month
export function getDaysInMonth(date: Date): Date[] {
  return eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date)
  });
}
