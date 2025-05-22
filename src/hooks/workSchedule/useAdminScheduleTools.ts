
import { useState, useCallback, useEffect } from "react";
import { WorkShift } from "@/types/workSchedule";
import { User } from "@/types";
import { useWeekdayShiftAssignment } from "./tools/useWeekdayShiftAssignment";
import { useWeekendShiftAssignment } from "./tools/useWeekendShiftAssignment";
import { useTimeOffConflictCheck } from "./tools/useTimeOffConflictCheck";
import { useAutoCoverageAssignment } from "./tools/useAutoCoverageAssignment";
import { AdminScheduleHookOptions, AdminScheduleHookResult, AdminScheduleActions } from "./types/adminScheduleTypes";

export function useAdminScheduleTools(
  options: AdminScheduleHookOptions
): AdminScheduleHookResult {
  const { scheduleData, onSave } = options;
  const [loading, setLoading] = useState(false);
  
  // Initialize tool hooks with callbacks if needed
  const { assignWeekdayShifts: weekdayAssign, loading: weekdayLoading } = useWeekdayShiftAssignment({
    onSaveComplete: () => console.log("Weekday shifts assigned successfully")
  });
  
  const { assignWeekendShifts: weekendAssign, loading: weekendLoading } = useWeekendShiftAssignment({
    onSaveComplete: () => console.log("Weekend shifts assigned successfully")
  });
  
  const { checkTimeOffConflicts: conflictCheck, loading: conflictLoading } = useTimeOffConflictCheck({
    onConflictFound: (conflicts) => console.log(`Found ${conflicts.length} conflicts`)
  });
  
  const { autoAssignCoverage: autoCoverage, loading: coverageLoading } = useAutoCoverageAssignment({
    onCoverageAssigned: (shift) => console.log("Coverage assigned:", shift)
  });

  // Update loading state based on all sub-hooks
  useEffect(() => {
    setLoading(weekdayLoading || weekendLoading || conflictLoading || coverageLoading);
  }, [weekdayLoading, weekendLoading, conflictLoading, coverageLoading]);

  // Wrapper for weekday shift assignment
  const assignWeekdayShifts = useCallback((
    employeeId: string, 
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string,
    daysToInclude: number[]
  ) => {
    return weekdayAssign(scheduleData, employeeId, startDate, endDate, startTime, endTime, daysToInclude, onSave);
  }, [scheduleData, onSave, weekdayAssign]);
  
  // Wrapper for weekend shift assignment
  const assignWeekendShifts = useCallback((
    employeeId: string,
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string
  ) => {
    return weekendAssign(scheduleData, employeeId, startDate, endDate, startTime, endTime, onSave);
  }, [scheduleData, onSave, weekendAssign]);
  
  // Wrapper for time off conflicts check
  const checkTimeOffConflicts = useCallback((
    employeeId: string,
    shifts: WorkShift[]
  ) => {
    return conflictCheck(employeeId, shifts);
  }, [conflictCheck]);
  
  // Wrapper for auto-assigning coverage
  const autoAssignCoverage = useCallback(async (
    gapDate: string,
    startTime: string,
    endTime: string,
    availableEmployees: User[]
  ) => {
    return autoCoverage(scheduleData, gapDate, startTime, endTime, availableEmployees);
  }, [scheduleData, autoCoverage]);

  // Create actions object that contains all action functions
  const actions: AdminScheduleActions = {
    assignWeekdayShifts,
    assignWeekendShifts,
    checkTimeOffConflicts,
    autoAssignCoverage
  };

  return {
    actions,
    loading
  };
}
