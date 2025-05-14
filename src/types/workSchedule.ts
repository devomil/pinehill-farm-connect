
export interface WorkShift {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurringPattern?: string; // e.g. 'weekly', 'bi-weekly'
  notes?: string;
}

export interface WorkSchedule {
  id: string;
  employeeId: string;
  month: string; // YYYY-MM format
  shifts: WorkShift[];
}

export interface WorkScheduleEditorProps {
  selectedEmployee: string | null;
  scheduleData: WorkSchedule | null;
  onSave: (schedule: WorkSchedule) => void;
  onReset: () => void;
  loading?: boolean; // Added loading prop
}
