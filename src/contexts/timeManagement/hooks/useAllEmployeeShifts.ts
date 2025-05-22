
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { WorkShift, WorkSchedule } from "@/types/workSchedule";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { supabase } from "@/integrations/supabase/client";
import { globalMockScheduleStore, clearAllMockData } from "@/components/time-management/work-schedule/scheduleHelpers";

export function useAllEmployeeShifts() {
  const [allShifts, setAllShifts] = useState<WorkShift[]>([]);
  const [shiftsMap, setShiftsMap] = useState<Map<string, WorkShift[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const { employees } = useEmployeeDirectory();
  
  // Clear mock data on first load (to reset between dashboard and time management views)
  useEffect(() => {
    // We'll clear the data once when this hook is first used
    if (employees && employees.length > 0) {
      // Always clear and recreate mock data when the time management view loads
      // This ensures we have consistent data across dashboard and time management
      console.log("Initializing fresh mock data for all employees");
      clearAllMockData();
      sessionStorage.setItem('mockDataInitialized', 'true');
    }
  }, [employees]);

  // Function to load all shifts
  const loadAllShifts = useCallback(() => {
    if (!employees || employees.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get all shifts from the global mock store
      const currentMonth = format(new Date(), "yyyy-MM");
      const mockShifts: WorkShift[] = [];
      
      // Collect all shifts from all employee schedules in the global store
      Object.values(globalMockScheduleStore).forEach((schedule: WorkSchedule) => {
        if (schedule.shifts && schedule.shifts.length > 0) {
          mockShifts.push(...schedule.shifts);
        }
      });
      
      // Always create mock shifts for each employee to ensure we always have data to display
      // This ensures the time management view always has data
      employees.forEach(employee => {
        // Generate 3-5 random shifts for each employee if they don't already have shifts
        // Check if employee already has shifts
        const existingShifts = mockShifts.filter(shift => shift.employeeId === employee.id);
        
        if (existingShifts.length === 0) {
          const shiftsCount = 3 + Math.floor(Math.random() * 3);
          
          for (let i = 0; i < shiftsCount; i++) {
            // Random day of month between 1-28
            const day = 1 + Math.floor(Math.random() * 28);
            const date = `${currentMonth}-${day.toString().padStart(2, '0')}`;
            
            // Random shift times - make them realistic working hours
            const startOptions = [8, 9, 10, 11, 12, 13, 14];
            const durationOptions = [4, 6, 8, 9]; // shift lengths in hours
            
            const startHour = startOptions[Math.floor(Math.random() * startOptions.length)];
            const duration = durationOptions[Math.floor(Math.random() * durationOptions.length)];
            const endHour = startHour + duration;
            
            const startTime = `${startHour.toString().padStart(2, '0')}:00:00`;
            const endTime = `${endHour.toString().padStart(2, '0')}:00:00`;
            
            const shift = {
              id: `${employee.id}-${date}-${i}`,
              employeeId: employee.id,
              date,
              startTime,
              endTime,
              isRecurring: false,
              notes: `Shift ${i+1} for ${employee.name}`
            };
            
            mockShifts.push(shift);
            
            // Add this shift to the employee's schedule in the global store
            if (!globalMockScheduleStore[employee.id]) {
              globalMockScheduleStore[employee.id] = {
                id: employee.id,
                employeeId: employee.id,
                month: currentMonth,
                shifts: []
              };
            }
            
            // Make sure we don't add duplicates
            if (!globalMockScheduleStore[employee.id].shifts.some(s => s.id === shift.id)) {
              globalMockScheduleStore[employee.id].shifts.push(shift);
            }
          }
        }
      });
      
      console.log("Created/loaded shifts for global store:", mockShifts.length);
      console.log("Global store now contains schedules for:", Object.keys(globalMockScheduleStore).length, "employees");
      
      setAllShifts(mockShifts);
      
      // Create map of dates to shifts
      const map = new Map<string, WorkShift[]>();
      mockShifts.forEach(shift => {
        if (!map.has(shift.date)) {
          map.set(shift.date, []);
        }
        map.get(shift.date)!.push(shift);
      });
      
      setShiftsMap(map);
      // Update last refresh time
      setLastRefreshTime(Date.now());
    } catch (err) {
      console.error("Error fetching all employee shifts:", err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [employees]);

  // Function to refresh shifts - can be called after shift updates
  const refreshShifts = useCallback(() => {
    console.log("Refreshing all employee shifts");
    loadAllShifts();
    return Promise.resolve(); // Return a promise for async usage
  }, [loadAllShifts]);

  // Initial load of all shifts
  useEffect(() => {
    loadAllShifts();
  }, [loadAllShifts]);
  
  return {
    allShifts,
    shiftsMap,
    loading,
    error,
    lastRefreshTime,
    refreshShifts
  };
}
