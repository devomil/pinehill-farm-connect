
import { useState, useCallback, useMemo, useEffect } from "react";
import { format, isValid } from "date-fns";

/**
 * Hook for managing day selection in calendars
 * Supports multiple day selection with tracking
 */
export const useDaySelector = (currentMonth: Date) => {
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  
  // Reset selected days when month changes
  useEffect(() => {
    setSelectedDays(new Set());
  }, [currentMonth.getMonth(), currentMonth.getFullYear()]);
  
  // Check if a day is selected
  const isDaySelected = useCallback((date: Date): boolean => {
    if (!isValid(date)) return false;
    
    const dateKey = format(date, "yyyy-MM-dd");
    return selectedDays.has(dateKey);
  }, [selectedDays]);
  
  // Toggle selection state of a day
  const toggleDay = useCallback((date: Date) => {
    if (!isValid(date)) return;
    
    const dateKey = format(date, "yyyy-MM-dd");
    
    setSelectedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey);
      } else {
        newSet.add(dateKey);
      }
      return newSet;
    });
  }, []);
  
  // Clear all selected days
  const clearSelectedDays = useCallback(() => {
    setSelectedDays(new Set());
  }, []);
  
  // Get array of selected days
  const getSelectedDaysArray = useCallback((): string[] => {
    return Array.from(selectedDays);
  }, [selectedDays]);
  
  // Count of selected days
  const selectedCount = useMemo(() => selectedDays.size, [selectedDays]);
  
  return {
    isDaySelected,
    toggleDay,
    clearSelectedDays,
    getSelectedDaysArray,
    selectedCount
  };
};
