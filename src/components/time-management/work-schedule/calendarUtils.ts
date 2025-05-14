
import { format, isValid } from "date-fns";
import { WorkShift } from "@/types/workSchedule";

// Format a date safely, handling errors
export const safeFormat = (date: Date, formatString: string): string => {
  try {
    return isValid(date) ? format(date, formatString) : "";
  } catch (e) {
    console.error("Invalid date format:", e);
    return "";
  }
};

// Check if a date is selected in single or multiple mode
export const isDateSelected = (
  day: Date,
  selectedDate: Date | undefined,
  isDaySelected?: (date: Date) => boolean
): { isSingleSelected: boolean, isMultiSelected: boolean } => {
  if (!isValid(day)) {
    return { isSingleSelected: false, isMultiSelected: false };
  }
  
  const isSingleSelected = selectedDate && isValid(selectedDate) && 
    day.getDate() === selectedDate.getDate() && 
    day.getMonth() === selectedDate.getMonth() && 
    day.getFullYear() === selectedDate.getFullYear();
  
  const isMultiSelected = Boolean(isDaySelected && isDaySelected(day));
  
  return { isSingleSelected, isMultiSelected };
};

// Get shifts for a specific day
export const getShiftsForDay = (
  day: Date,
  shiftsMap: Map<string, WorkShift[]>
): WorkShift[] => {
  if (!isValid(day)) return [];
  
  const dateStr = safeFormat(day, "yyyy-MM-dd");
  return shiftsMap.get(dateStr) || [];
};
