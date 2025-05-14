
import { useState, useCallback } from "react";
import { format } from "date-fns";

export interface SelectedDayInfo {
  dateStr: string;
  selected: boolean;
}

export function useDaySelector(currentMonth: Date) {
  const [selectedDays, setSelectedDays] = useState<Map<string, boolean>>(new Map());

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
  }, []);

  const isDaySelected = useCallback((date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    return selectedDays.has(dateStr);
  }, [selectedDays]);

  const clearSelectedDays = useCallback(() => {
    setSelectedDays(new Map());
  }, []);

  const getSelectedDaysArray = useCallback((): string[] => {
    return Array.from(selectedDays.keys());
  }, [selectedDays]);

  return {
    selectedDays,
    toggleDay,
    isDaySelected,
    clearSelectedDays,
    getSelectedDaysArray
  };
}
