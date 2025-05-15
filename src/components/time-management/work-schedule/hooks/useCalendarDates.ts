
import { useState } from "react";
import { buildShiftsMap } from "../scheduleHelpers";
import { WorkSchedule } from "@/types/workSchedule";

export function useCalendarDates(scheduleData: WorkSchedule | null) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // Create map of dates to shifts
  const shiftsMap = buildShiftsMap(scheduleData);

  return {
    selectedDate,
    setSelectedDate,
    currentMonth,
    setCurrentMonth,
    shiftsMap
  };
}
