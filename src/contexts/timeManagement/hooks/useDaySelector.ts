
import { useState, useCallback } from 'react';
import { format } from 'date-fns';

/**
 * Hook to manage day selection for calendars
 * with proper memoization and performance optimization
 */
export function useDaySelector() {
  const [selectedDays, setSelectedDays] = useState<Map<string, Date>>(new Map());
  
  // Memoized toggle function to prevent unnecessary re-renders
  const toggleDay = useCallback((date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    
    setSelectedDays(prev => {
      const newMap = new Map(prev);
      
      if (newMap.has(dateKey)) {
        newMap.delete(dateKey);
      } else {
        newMap.set(dateKey, date);
      }
      
      return newMap;
    });
  }, []);
  
  // Check if a day is selected - optimized to prevent unnecessary calculations
  const isDaySelected = useCallback((date: Date): boolean => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return selectedDays.has(dateKey);
  }, [selectedDays]);
  
  // Get all selected days as an array - memoized to prevent recreating on every render
  const getSelectedDaysArray = useCallback((): Date[] => {
    return Array.from(selectedDays.values());
  }, [selectedDays]);
  
  // Clear all selections
  const clearSelectedDays = useCallback(() => {
    setSelectedDays(new Map());
  }, []);
  
  return {
    selectedDays,
    toggleDay,
    isDaySelected,
    getSelectedDaysArray,
    clearSelectedDays
  };
}
