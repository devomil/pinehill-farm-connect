
import { useState } from "react";
import { addMonths, subMonths } from "date-fns";

export const useDashboardCalendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "team">("month");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  return {
    date,
    viewMode,
    currentMonth,
    handleDateSelect,
    setViewMode,
    goToPreviousMonth,
    goToNextMonth
  };
};
