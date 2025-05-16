
import { useState, useCallback, useMemo } from "react";

/**
 * Hook for managing date selections in calendars and schedules
 */
export const useDaySelector = (currentMonth?: Date) => {
  // Track selected days in a Map for O(1) lookups
  const [selectedDays, setSelectedDays] = useState<Map<string, Date>>(new Map());

  // Toggle a day's selection status
  const toggleDay = useCallback((date: Date) => {
    if (!date) {
      console.error("Cannot toggle undefined date");
      return;
    }
    
    const dateKey = date.toISOString().split('T')[0];
    
    setSelectedDays(prev => {
      const newMap = new Map(prev);
      if (newMap.has(dateKey)) {
        newMap.delete(dateKey);
        console.log(`Removed day ${dateKey}, now unselected`);
      } else {
        newMap.set(dateKey, new Date(date));
        console.log(`Added day ${dateKey}, now selected`);
      }
      return newMap;
    });
  }, []);

  // Check if a day is selected
  const isDaySelected = useCallback((date: Date) => {
    if (!date) return false;
    
    const dateKey = date.toISOString().split('T')[0];
    const isSelected = selectedDays.has(dateKey);
    console.log(`Checking if day ${dateKey} is selected: ${isSelected}`);
    return isSelected;
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
