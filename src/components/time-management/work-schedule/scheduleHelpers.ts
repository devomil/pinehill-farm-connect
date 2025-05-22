
import { WorkSchedule, WorkShift } from "@/types/workSchedule";
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

// Shared mock store that will be used across all components
export const globalMockScheduleStore: Record<string, WorkSchedule> = {};

/**
 * Builds a map of date strings to arrays of shifts
 */
export function buildShiftsMap(scheduleData: WorkSchedule | null): Map<string, WorkShift[]> {
  const shiftsMap = new Map<string, WorkShift[]>();
  
  if (scheduleData?.shifts) {
    scheduleData.shifts.forEach(shift => {
      const dateKey = shift.date;
      if (!shiftsMap.has(dateKey)) {
        shiftsMap.set(dateKey, []);
      }
      shiftsMap.get(dateKey)!.push(shift);
    });
  }
  
  return shiftsMap;
}

/**
 * Creates a new shift for a given employee and date
 */
export function createNewShift(employeeId: string, date: Date): WorkShift {
  return {
    id: uuidv4(),
    employeeId: employeeId,
    date: format(date, 'yyyy-MM-dd'),
    startTime: '09:00:00',
    endTime: '17:00:00',
    isRecurring: false,
    notes: ''
  };
}

/**
 * Clears all mock schedule data
 */
export function clearAllMockData() {
  // Clear all keys in the global store
  Object.keys(globalMockScheduleStore).forEach(key => {
    delete globalMockScheduleStore[key];
  });
  console.log("All mock schedule data cleared");
  return true;
}

/**
 * Gets mock schedule for an employee, creating a new one if it doesn't exist
 */
export function getMockScheduleForEmployee(employeeId: string, currentMonth: string): WorkSchedule {
  if (!globalMockScheduleStore[employeeId]) {
    globalMockScheduleStore[employeeId] = {
      id: uuidv4(),
      employeeId,
      month: currentMonth,
      shifts: []
    };
  }
  
  return globalMockScheduleStore[employeeId];
}
