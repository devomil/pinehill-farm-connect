
import { WorkSchedule, WorkShift } from "@/types/workSchedule";
import { User } from "@/types";

export interface AdminScheduleActions {
  assignWeekdayShifts: (
    employeeId: string,
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string,
    daysToInclude: number[]
  ) => void;

  assignWeekendShifts: (
    employeeId: string,
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string
  ) => void;

  checkTimeOffConflicts: (
    employeeId: string,
    shifts: WorkShift[]
  ) => Promise<string[]>;

  autoAssignCoverage: (
    gapDate: string,
    startTime: string,
    endTime: string,
    availableEmployees: User[]
  ) => Promise<WorkShift | null>;
}

export interface AdminScheduleHookOptions {
  scheduleData: WorkSchedule | null;
  onSave: (schedule: WorkSchedule) => void;
}

export interface AdminScheduleHookResult {
  actions: AdminScheduleActions;
  loading: boolean;
}

// Tool-specific types

// Weekday Shift Assignment
export interface WeekdayShiftAssignmentOptions {
  onSaveComplete?: () => void;
}

export interface WeekdayShiftAssignmentResult {
  assignWeekdayShifts: (
    scheduleData: WorkSchedule | null,
    employeeId: string,
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string,
    daysToInclude: number[],
    onSave: (schedule: WorkSchedule) => void
  ) => void;
  loading: boolean;
}

// Weekend Shift Assignment
export interface WeekendShiftAssignmentOptions {
  onSaveComplete?: () => void;
}

export interface WeekendShiftAssignmentResult {
  assignWeekendShifts: (
    scheduleData: WorkSchedule | null,
    employeeId: string,
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string,
    onSave: (schedule: WorkSchedule) => void
  ) => void;
  loading: boolean;
}

// Time Off Conflict Check
export interface TimeOffConflictCheckOptions {
  onConflictFound?: (conflicts: string[]) => void;
}

export interface TimeOffConflictCheckResult {
  checkTimeOffConflicts: (
    employeeId: string,
    shifts: WorkShift[]
  ) => Promise<string[]>;
  loading: boolean;
}

// Auto Coverage Assignment
export interface AutoCoverageAssignmentOptions {
  onCoverageAssigned?: (shift: WorkShift | null) => void;
}

export interface AutoCoverageAssignmentResult {
  autoAssignCoverage: (
    scheduleData: WorkSchedule | null,
    gapDate: string,
    startTime: string,
    endTime: string,
    availableEmployees: User[]
  ) => Promise<WorkShift | null>;
  loading: boolean;
}
