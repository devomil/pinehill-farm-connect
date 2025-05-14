
import { useState, useCallback } from "react";
import { format } from "date-fns";

export function useDaySelector(currentMonth: Date) {
  const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({});
  
  // Toggle day selection
  const toggleDay = useCallback((date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    
    setSelectedDays(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
  }, []);
  
  // Check if a day is selected
  const isDaySelected = useCallback((date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    return !!selectedDays[dateStr];
  }, [selectedDays]);
  
  // Get an array of selected days
  const getSelectedDaysArray = useCallback((): string[] => {
    return Object.entries(selectedDays)
      .filter(([_, isSelected]) => isSelected)
      .map(([dateStr]) => dateStr);
  }, [selectedDays]);
  
  // Clear all selected days
  const clearSelectedDays = useCallback(() => {
    setSelectedDays({});
  }, []);
  
  // Get the count of selected days
  const selectedCount = Object.values(selectedDays).filter(Boolean).length;
  
  return {
    toggleDay,
    isDaySelected,
    getSelectedDaysArray,
    clearSelectedDays,
    selectedCount
  };
}
