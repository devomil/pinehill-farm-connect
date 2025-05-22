
import { startOfMonth, endOfMonth, addDays, getDay } from "date-fns";

/**
 * Generate an array of days for the calendar grid including padding days
 * from previous and next months to fill the grid completely
 */
export const generateCalendarDays = (currentMonth: Date): Date[] => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = monthStart;
  const endDate = monthEnd;
  
  // Get the starting day of week (0 = Sunday, 1 = Monday, etc.)
  const startDay = getDay(startDate);
  
  // Create array for days in the month + padding days
  const days = [];
  
  // Add days from previous month to start from Sunday or fill the first row
  for (let i = 0; i < startDay; i++) {
    const prevDate = addDays(startDate, -1 * (startDay - i));
    days.push(prevDate);
  }
  
  // Add all days in the current month
  let currentDate = startDate;
  while (currentDate <= endDate) {
    days.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }
  
  // Add days from next month to complete the last row if needed
  const remainingCells = 7 - (days.length % 7);
  if (remainingCells < 7) {
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = addDays(endDate, i);
      days.push(nextDate);
    }
  }
  
  return days;
};
