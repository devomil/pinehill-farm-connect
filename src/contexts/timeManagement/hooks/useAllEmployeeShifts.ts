
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { WorkShift, WorkSchedule } from "@/types/workSchedule";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { supabase } from "@/integrations/supabase/client";

export function useAllEmployeeShifts() {
  const [allShifts, setAllShifts] = useState<WorkShift[]>([]);
  const [shiftsMap, setShiftsMap] = useState<Map<string, WorkShift[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { employees } = useEmployeeDirectory();

  // Fetch all employee shifts for admin view
  useEffect(() => {
    const fetchAllShifts = async () => {
      if (!employees || employees.length === 0) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // For demo purposes, create mock data for each employee
        // In a real implementation, you would fetch this from your database
        const currentMonth = format(new Date(), "yyyy-MM");
        const mockShifts: WorkShift[] = [];
        
        // Create mock shifts for each employee
        employees.forEach(employee => {
          // Generate 5-10 random shifts for each employee
          const shiftsCount = 5 + Math.floor(Math.random() * 5);
          
          for (let i = 0; i < shiftsCount; i++) {
            // Random day of month between 1-28
            const day = 1 + Math.floor(Math.random() * 28);
            const date = `${currentMonth}-${day.toString().padStart(2, '0')}`;
            
            // Random shift times
            const startHour = 8 + Math.floor(Math.random() * 10);
            const startTime = `${startHour.toString().padStart(2, '0')}:00:00`;
            const endTime = `${(startHour + 8).toString().padStart(2, '0')}:00:00`;
            
            mockShifts.push({
              id: `${employee.id}-${date}-${i}`,
              employeeId: employee.id,
              date,
              startTime,
              endTime,
              isRecurring: false,
              notes: `Shift ${i+1} for ${employee.name}`
            });
          }
        });
        
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
    };
    
    fetchAllShifts();
  }, [employees]);
  
  return {
    allShifts,
    shiftsMap,
    loading,
    error
  };
}
