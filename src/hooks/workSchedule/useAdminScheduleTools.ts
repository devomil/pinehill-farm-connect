
import { useState, useCallback } from "react";
import { WorkSchedule, WorkShift } from "@/types/workSchedule";
import { User } from "@/types";
import { useWeekdayShiftAssignment } from "./tools/useWeekdayShiftAssignment";
import { useWeekendShiftAssignment } from "./tools/useWeekendShiftAssignment";
import { useTimeOffConflictCheck } from "./tools/useTimeOffConflictCheck";
import { useAutoCoverageAssignment } from "./tools/useAutoCoverageAssignment";

export function useAdminScheduleTools(
  scheduleData: WorkSchedule | null,
  onSave: (schedule: WorkSchedule) => void
) {
  const [loading, setLoading] = useState(false);
  const { assignWeekdayShifts: weekdayAssign, loading: weekdayLoading } = useWeekdayShiftAssignment();
  const { assignWeekendShifts: weekendAssign, loading: weekendLoading } = useWeekendShiftAssignment();
  const { checkTimeOffConflicts: conflictCheck, loading: conflictLoading } = useTimeOffConflictCheck();
  const { autoAssignCoverage: autoCoverage, loading: coverageLoading } = useAutoCoverageAssignment();

  // Update loading state based on all sub-hooks
  useState(() => {
    setLoading(weekdayLoading || weekendLoading || conflictLoading || coverageLoading);
  });

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
    shifts: WorkShift[]
  ) => {
    return conflictCheck(shifts);
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

  return {
    assignWeekdayShifts,
    assignWeekendShifts,
    checkTimeOffConflicts,
    autoAssignCoverage,
    loading
  };
}
