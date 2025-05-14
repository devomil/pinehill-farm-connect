
import { useState, useCallback, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

export interface SelectedDayInfo {
  dateStr: string;
  selected: boolean;
}

export function useDaySelector(currentMonth: Date) {
  // Map of date strings to selection status
  const [selectedDays, setSelectedDays] = useState<Map<string, boolean>>(new Map());
  
  // Generate available days for the current month
  const availableDays = useMemo(() => {
    if (!currentMonth) return [];
    
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);
  
  // Clear selections when month changes
  useEffect(() => {
    setSelectedDays(new Map());
  }, [currentMonth]);

  // Toggle selection status of a day
  const toggleDay = useCallback((date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    
    setSelectedDays(prev => {
      const newMap = new Map(prev);
      if (newMap.has(dateStr)) {
        newMap.delete(dateStr);
      } else {
        newMap.set(dateStr, true);
      }
      return newMap;
    });
    
    console.log(`Toggled day: ${dateStr}, now ${!selectedDays.has(dateStr) ? 'selected' : 'unselected'}`);
  }, [selectedDays]);

  // Check if a day is selected
  const isDaySelected = useCallback((date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    return selectedDays.has(dateStr);
  }, [selectedDays]);

  // Clear all selections
  const clearSelectedDays = useCallback(() => {
    setSelectedDays(new Map());
  }, []);

  // Get array of selected day strings
  const getSelectedDaysArray = useCallback((): string[] => {
    return Array.from(selectedDays.keys());
  }, [selectedDays]);
  
  // Count selected days
  const selectedCount = useMemo(() => selectedDays.size, [selectedDays]);

  return {
    selectedDays,
    availableDays,
    toggleDay,
    isDaySelected,
    clearSelectedDays,
    getSelectedDaysArray,
    selectedCount
  };
}
