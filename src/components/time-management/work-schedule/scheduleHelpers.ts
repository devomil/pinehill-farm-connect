
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { WorkSchedule, WorkShift } from "@/types/workSchedule";
import { v4 as uuidv4 } from 'uuid';

// Get all days in a month
export const getDaysInMonth = (date: Date) => {
  return eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date)
  });
};

// Build map of dates to shifts
export const buildShiftsMap = (scheduleData: WorkSchedule | null) => {
  if (!scheduleData || !scheduleData.shifts) return new Map();
  
  const map = new Map();
  scheduleData.shifts.forEach(shift => {
    const dateKey = shift.date;
    if (!map.has(dateKey)) {
      map.set(dateKey, []);
    }
    map.get(dateKey).push(shift);
  });
  return map;
};

// Create a new shift
export const createNewShift = (employeeId: string, date: Date): WorkShift => {
  return {
    id: uuidv4(),
    employeeId,
    date: format(date, "yyyy-MM-dd"),
    startTime: "09:00:00",
    endTime: "17:00:00",
    isRecurring: false
  };
};

// Compare two dates (day, month, year only)
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};
