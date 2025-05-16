
import { useState, useCallback, useMemo } from "react";

/**
 * Hook for managing date selections in calendars and schedules
 */
export const useDaySelector = (currentMonth?: Date) => {
  // Track selected days in a Map for O(1) lookups
  const [selectedDays, setSelectedDays] = useState<Map<string, Date>>(new Map());

  // Toggle a day's selection status
  const toggleDay = useCallback((date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    
    setSelectedDays(prev => {
      const newMap = new Map(prev);
      if (newMap.has(dateKey)) {
        newMap.delete(dateKey);
      } else {
        newMap.set(dateKey, new Date(date));
      }
      return newMap;
    });
    
    // Log toggle action to verify functionality
    console.log(`Toggled day ${dateKey}, now ${selectedDays.has(dateKey) ? 'unselected' : 'selected'}`);
  }, [selectedDays]);

  // Check if a day is selected
  const isDaySelected = useCallback((date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return selectedDays.has(dateKey);
  }, [selectedDays]);

  // Get selected count
  const selectedCount = useMemo(() => selectedDays.size, [selectedDays]);

  // Get array of selected days as Date objects
  const getSelectedDaysArray = useCallback(() => {
    return Array.from(selectedDays.values());
  }, [selectedDays]);

  // Get array of selected days as strings (YYYY-MM-DD)
  const getSelectedDayStrings = useCallback(() => {
    return Array.from(selectedDays.keys());
  }, [selectedDays]);

  // Clear all selected days
  const clearSelectedDays = useCallback(() => {
    setSelectedDays(new Map());
    console.log("Cleared all selected days");
  }, []);

  return {
    selectedDays,
    toggleDay,
    isDaySelected,
    getSelectedDaysArray,
    getSelectedDayStrings,
    clearSelectedDays,
    selectedCount
  };
};
