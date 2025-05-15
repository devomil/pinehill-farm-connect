
import { useState } from "react";
import { WorkSchedule, WorkShift } from "@/types/workSchedule";
import { TimeOffRequest } from "@/types/timeManagement";
import { showToast } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { isWithinInterval, parseISO } from "date-fns";
import { v4 as uuidv4 } from 'uuid';

export function useTimeOffScheduleUpdater(currentUser: User | null) {
  const [processing, setProcessing] = useState(false);

  // Handle schedule updates when time off is approved
  const handleTimeOffApproval = async (
    timeOffRequest: TimeOffRequest,
    triggerCoverage: boolean = true
  ) => {
    if (!currentUser) {
      showToast({ 
        description: "You must be logged in to update schedules", 
        variant: "destructive" 
      });
      return false;
    }

    if (!timeOffRequest || timeOffRequest.status !== 'approved') {
      return false;
    }

    setProcessing(true);

    try {
      const employeeId = timeOffRequest.user_id;
      
      // Since we don't have an actual work_schedules table, we'll use mock data
      // In a real implementation with work_schedules table, you would:
      // const { data: scheduleData, error: scheduleError } = await supabase
      //   .from('work_schedules')
      //   .select('*')
      //   .eq('employeeId', employeeId)
      //   .single();
        
      // If no schedule exists, create mock data for demo
      const employeeSchedule: WorkSchedule = {
        id: `mock-${employeeId}`,
        employeeId: employeeId,
        month: new Date().toISOString().substring(0, 7), // YYYY-MM
        shifts: []
      };

      // Step 2: Find shifts that overlap with the time off period
      const startDate = timeOffRequest.startDate ? timeOffRequest.startDate : parseISO(timeOffRequest.start_date);
      const endDate = timeOffRequest.endDate ? timeOffRequest.endDate : parseISO(timeOffRequest.end_date);
      
      const overlappingShifts = employeeSchedule.shifts.filter(shift => {
        const shiftDate = parseISO(shift.date);
        return isWithinInterval(shiftDate, { start: startDate, end: endDate });
      });
      
      if (overlappingShifts.length === 0) {
        showToast({ 
          description: "Time-off approved, no shifts needed adjustment", 
          variant: "success" 
        });
        return true;
      }

      // Step 3: Remove overlapping shifts from employee's schedule
      const updatedShifts = employeeSchedule.shifts.filter(shift => {
        const shiftDate = parseISO(shift.date);
        return !isWithinInterval(shiftDate, { start: startDate, end: endDate });
      });
      
      // Step 4: Update employee schedule in database (in real implementation)
      // For demo, we'll just show the toast
      
      // Step 5: Trigger coverage requests if needed
      if (triggerCoverage && overlappingShifts.length > 0) {
        // In a real implementation, this would create shift coverage requests
        console.log("Triggering coverage requests for shifts:", overlappingShifts);
      }
      
      showToast({ 
        description: "Time-off approved and schedule updated", 
        variant: "success" 
      });
      
      return true;
    } catch (error) {
      console.error("Error updating schedule for time-off:", error);
      showToast({ 
        description: "Failed to update schedule for approved time-off", 
        variant: "destructive" 
      });
      return false;
    } finally {
      setProcessing(false);
    }
  };

  return {
    handleTimeOffApproval,
    processing
  };
}
