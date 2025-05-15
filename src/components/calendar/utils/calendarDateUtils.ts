
import { format } from "date-fns";
import { TimeOffRequest } from "@/types/timeManagement";
import { WorkShift } from "@/types/workSchedule";

// Function to get date string in YYYY-MM-DD format
export const getDateKey = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

// Helper to extract standard HTML attributes and exclude custom props
export const extractHTMLAttributes = (props: Record<string, any>): Record<string, any> => {
  // Create a shallow copy to avoid modifying the original props
  const htmlProps = { ...props };
  
  // Remove known non-HTML attributes that might be present in DayPicker props
  const nonHTMLAttributes = ['displayMonth', 'selected', 'disabled', 'hidden', 'outside', 'today'];
  nonHTMLAttributes.forEach(attr => {
    if (attr in htmlProps) {
      delete htmlProps[attr];
    }
  });
  
  return htmlProps;
};

// Type for calendar event data
export interface CalendarEventMap {
  timeOff: TimeOffRequest[];
  shifts: WorkShift[];
  shiftCoverage: any[];
}

// Process calendar events into a map by date
export const processCalendarEvents = (
  timeOffRequests: TimeOffRequest[], 
  shifts: WorkShift[], 
  shiftCoverage: any[]
): Map<string, CalendarEventMap> => {
  const eventsMap = new Map<string, CalendarEventMap>();
  
  // Add time off requests
  if (timeOffRequests && timeOffRequests.length > 0) {
    timeOffRequests.forEach(request => {
      const startDate = new Date(request.start_date);
      const endDate = new Date(request.end_date);
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateKey = getDateKey(currentDate);
        const currentEvents = eventsMap.get(dateKey) || { timeOff: [], shifts: [], shiftCoverage: [] };
        currentEvents.timeOff.push(request);
        eventsMap.set(dateKey, currentEvents);
        
        // Move to next day
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);
        currentDate = nextDate;
      }
    });
  }
  
  // Add work shifts
  shifts.forEach(shift => {
    const dateKey = shift.date;
    const currentEvents = eventsMap.get(dateKey) || { timeOff: [], shifts: [], shiftCoverage: [] };
    currentEvents.shifts.push(shift);
    eventsMap.set(dateKey, currentEvents);
  });
  
  // Add shift coverage
  shiftCoverage.forEach(coverage => {
    const dateKey = coverage.shift_date;
    const currentEvents = eventsMap.get(dateKey) || { timeOff: [], shifts: [], shiftCoverage: [] };
    currentEvents.shiftCoverage.push(coverage);
    eventsMap.set(dateKey, currentEvents);
  });
  
  return eventsMap;
};
