
import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import { WorkSchedule, WorkShift } from "@/types/workSchedule";

// Global mock store for schedules
export const globalMockScheduleStore: Record<string, WorkSchedule> = {};

// Helper function to clear all mock data
export function clearAllMockData() {
  Object.keys(globalMockScheduleStore).forEach(key => {
    delete globalMockScheduleStore[key];
  });
  console.log("Cleared all mock schedule data");
}

// Helper function to get or create a mock schedule for an employee
export function getMockScheduleForEmployee(employeeId: string, month: string): WorkSchedule {
  if (globalMockScheduleStore[employeeId]) {
    return globalMockScheduleStore[employeeId];
  }
  
  // Create a new empty schedule
  const newSchedule = createEmptySchedule(employeeId, month);
  globalMockScheduleStore[employeeId] = newSchedule;
  return newSchedule;
}

// Helper function to create a new shift object
export function createNewShift(employeeId: string, date: Date): WorkShift {
  // Format the date as YYYY-MM-DD
  const formattedDate = format(date, "yyyy-MM-dd");
  
  // Log the creation date
  console.log(`Creating new shift for ${employeeId} on ${formattedDate}`);
  
  return {
    id: uuid(),
    employeeId,
    date: formattedDate, // Properly formatted date string
    startTime: "09:00",
    endTime: "17:00",
    isRecurring: false,
    notes: ""
  };
}

// Helper function to create a map of dates to shifts
export function buildShiftsMap(scheduleData: WorkSchedule | null): Map<string, WorkShift[]> {
  const shiftsMap = new Map<string, WorkShift[]>();
  
  if (!scheduleData) return shiftsMap;
  
  for (const shift of scheduleData.shifts) {
    // Use the shift's date string directly as the key
    const dateKey = shift.date;
    
    if (!shiftsMap.has(dateKey)) {
      shiftsMap.set(dateKey, []);
    }
    
    const shifts = shiftsMap.get(dateKey);
    if (shifts) {
      shifts.push(shift);
    }
  }
  
  return shiftsMap;
}

// Helper function to check if two schedules have the same shifts
export function schedulesEqual(a: WorkSchedule, b: WorkSchedule): boolean {
  if (a.shifts.length !== b.shifts.length) return false;
  
  // Create a map for faster lookup
  const shiftsB = new Map(b.shifts.map(shift => [shift.id, shift]));
  
  for (const shiftA of a.shifts) {
    const shiftB = shiftsB.get(shiftA.id);
    if (!shiftB) return false;
    
    if (shiftA.date !== shiftB.date ||
        shiftA.startTime !== shiftB.startTime ||
        shiftA.endTime !== shiftB.endTime ||
        shiftA.isRecurring !== shiftB.isRecurring ||
        shiftA.recurringPattern !== shiftB.recurringPattern ||
        shiftA.notes !== shiftB.notes) {
      return false;
    }
  }
  
  return true;
}

// Create default schedule for an employee
export function createEmptySchedule(employeeId: string, month: string): WorkSchedule {
  return {
    id: uuid(),
    employeeId,
    month,
    shifts: []
  };
}
