
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

export interface AdminScheduleHookResult extends AdminScheduleActions {
  loading: boolean;
}
