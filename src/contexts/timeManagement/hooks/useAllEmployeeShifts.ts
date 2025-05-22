
import { useState, useEffect } from "react";
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
  const { employees } = useEmployeeDirectory();
  
  // Clear mock data on first load (to reset between dashboard and time management views)
  useEffect(() => {
    // We'll clear the data once when this hook is first used
    if (employees && employees.length > 0) {
      const shouldClearData = Object.keys(globalMockScheduleStore).length === 0 || 
                             !sessionStorage.getItem('mockDataInitialized');
      
      if (shouldClearData) {
        console.log("Initializing fresh mock data for all employees");
        clearAllMockData();
        sessionStorage.setItem('mockDataInitialized', 'true');
      }
    }
  }, [employees]);

  // Fetch all employee shifts for admin view
  useEffect(() => {
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
      
      // If no shifts exist in the global store, create some sample data
      // This helps populate the view when first accessing it
      if (mockShifts.length === 0) {
        // Create mock shifts for each employee
        employees.forEach(employee => {
          // Generate 3-5 random shifts for each employee
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
        });
        
        console.log("Created sample shifts for global store:", mockShifts.length);
      } else {
        console.log("Using existing shifts from global store:", mockShifts.length);
      }
      
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
    } catch (err) {
      console.error("Error fetching all employee shifts:", err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [employees]);
  
  return {
    allShifts,
    shiftsMap,
    loading,
    error
  };
}
