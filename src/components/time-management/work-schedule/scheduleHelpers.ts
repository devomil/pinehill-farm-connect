
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { WorkSchedule, WorkShift } from "@/types/workSchedule";
import { v4 as uuidv4 } from 'uuid';

// Build a map of dates to shifts
export const buildShiftsMap = (scheduleData: WorkSchedule | null): Map<string, WorkShift[]> => {
  if (!scheduleData || !scheduleData.shifts) return new Map();
  
  const map = new Map();
  scheduleData.shifts.forEach(shift => {
    const shiftDate = parse(shift.date, "yyyy-MM-dd", new Date());
    const dateKey = format(shiftDate, "yyyy-MM-dd");
    if (!map.has(dateKey)) {
      map.set(dateKey, []);
    }
    map.get(dateKey).push(shift);
  });
  return map;
};

// Get all days in the current month
export const getDaysInMonth = (date: Date) => {
  return eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date)
  });
};

// Create a new shift object
export const createNewShift = (employeeId: string, date: Date): WorkShift => {
  const dateStr = format(date, "yyyy-MM-dd");
  
  return {
    id: uuidv4(),
    employeeId,
    date: dateStr,
    startTime: "09:00",
    endTime: "17:00",
    isRecurring: false,
    notes: ""
  };
};
