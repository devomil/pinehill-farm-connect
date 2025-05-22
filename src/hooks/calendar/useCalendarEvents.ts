
import { useState, useEffect, useMemo } from "react";
import { TimeOffRequest } from "@/types/timeManagement";
import { WorkShift } from "@/types/workSchedule";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { processCalendarEvents, CalendarEventMap } from "@/components/calendar/utils/calendarDateUtils";
import { format } from "date-fns";

export const useCalendarEvents = (
  currentUser: User | undefined,
  currentMonth: Date,
  includeDeclinedRequests: boolean = false,
  timeOffRequests: TimeOffRequest[]
) => {
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [shiftCoverage, setShiftCoverage] = useState<any[]>([]);
  const [shiftsMap, setShiftsMap] = useState<Map<string, WorkShift[]>>(new Map());
  
  // Filter time off requests based on status
  const filteredTimeOffRequests = useMemo(() => {
    return includeDeclinedRequests 
      ? timeOffRequests 
      : timeOffRequests.filter(req => req.status !== 'rejected');
  }, [timeOffRequests, includeDeclinedRequests]);

  // Process all calendar events into a map
  const calendarEvents = useMemo(() => {
    return processCalendarEvents(
      filteredTimeOffRequests,
      shifts,
      shiftCoverage
    );
  }, [filteredTimeOffRequests, shifts, shiftCoverage]);

  // Fetch work schedules for the month view
  useEffect(() => {
    // Guard against undefined currentUser
    if (!currentUser) {
      console.log("useCalendarEvents: currentUser is undefined, skipping fetch");
      return;
    }
    
    const fetchWorkSchedules = async () => {
      const monthStr = format(currentMonth, "yyyy-MM");
      
      try {
        // Use specific table name and structure that exists in Supabase
        const { data, error } = await supabase
          .from('shift_coverage_requests')
          .select('*')
          .eq('original_employee_id', currentUser.id);
          
        if (error) {
          console.error('Error fetching shift data:', error);
        } else if (data) {
          // Process the data
          const formattedShifts: WorkShift[] = data
            // Filter out declined shifts if we're not including declined requests
            .filter(item => includeDeclinedRequests || item.status !== 'declined')
            .map(item => ({
              id: item.id,
              employeeId: item.original_employee_id,
              date: item.shift_date,
              startTime: item.shift_start,
              endTime: item.shift_end,
              isRecurring: false,
              notes: `Shift coverage: ${item.status}`
            }));
          setShifts(formattedShifts);
          
          // Create a map of dates to shifts for easier lookup
          const shiftsByDate = new Map<string, WorkShift[]>();
          formattedShifts.forEach(shift => {
            if (!shiftsByDate.has(shift.date)) {
              shiftsByDate.set(shift.date, []);
            }
            shiftsByDate.get(shift.date)!.push(shift);
          });
          setShiftsMap(shiftsByDate);
        }
      } catch (error) {
        console.error('Error in fetch:', error);
      }
    };

    const fetchShiftCoverage = async () => {
      // Guard against undefined currentUser
      if (!currentUser) return;
      
      try {
        const { data, error } = await supabase
          .from('shift_coverage_requests')
          .select('*')
          .or(`original_employee_id.eq.${currentUser.id},covering_employee_id.eq.${currentUser.id}`)
          // Filter out declined shifts if we're not including declined requests
          .not('status', 'eq', includeDeclinedRequests ? '' : 'declined');
          
        if (error) {
          console.error('Error fetching shift coverage:', error);
        } else {
          setShiftCoverage(data || []);
        }
      } catch (error) {
        console.error('Error in shift coverage fetch:', error);
      }
    };

    fetchWorkSchedules();
    fetchShiftCoverage();
  }, [currentUser, currentMonth, includeDeclinedRequests]);

  return {
    calendarEvents,
    shifts,
    shiftCoverage,
    shiftsMap
  };
};
