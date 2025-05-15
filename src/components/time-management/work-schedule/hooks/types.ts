
import { WorkSchedule, WorkShift } from "@/types/workSchedule";

export interface UseScheduleEditorProps {
  selectedEmployee: string | null;
  scheduleData: WorkSchedule | null;
  onSave: (schedule: WorkSchedule) => void;
}

export interface ScheduleEditorState {
  selectedDate: Date | undefined;
  currentMonth: Date;
  isDialogOpen: boolean;
  editingShift: WorkShift | null;
  isEditMode: boolean;
  bulkMode: string | null;
  selectionMode: "single" | "multiple";
}
