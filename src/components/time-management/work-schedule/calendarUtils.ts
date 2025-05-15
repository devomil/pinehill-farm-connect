
import { format, isValid, isSameDay } from "date-fns";
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
  
  // Check if day is selected in single selection mode
  const isSingleSelected = selectedDate && isValid(selectedDate) && 
    isSameDay(day, selectedDate);
  
  // Check if day is selected in multiple selection mode
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

// Create calendar days for testing and debugging
export const getDebugInfo = (
  currentMonth: Date,
  shiftsMap: Map<string, WorkShift[]>,
  selectedDate?: Date,
  isDaySelected?: (date: Date) => boolean
) => {
  console.log("Calendar Debug Info:");
  console.log("Current month:", format(currentMonth, "MMMM yyyy"));
  console.log("Selected date:", selectedDate ? format(selectedDate, "yyyy-MM-dd") : "None");
  console.log("Shifts count:", shiftsMap.size);
  console.log("Selection mode:", isDaySelected ? "multiple" : "single");
  
  // Generate days in month for debug purposes
  try {
    const daysInMonth = [];
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      daysInMonth.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    }
    
    console.log(`Generated ${daysInMonth.length} days for ${format(currentMonth, "MMMM yyyy")}`);
  } catch (e) {
    console.error("Error generating debug days:", e);
  }
};
