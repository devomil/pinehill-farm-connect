
// Define the actual shape of what comes back from the database
export interface DBShiftReport {
  id: string;
  created_at: string;
  user_id: string;
  date: string;
  admin_id: string | null;
  notes: string;
  priority: string;
  updated_at: string;
}

// Define the full ShiftReport with all fields needed by the UI components
export interface ShiftReport {
  id: string;
  created_at: string;
  user_id: string;
  date: string;
  shift_start: string;
  shift_end: string;
  total_hours: number;
  tasks_completed: string;
  challenges_faced: string;
  lessons_learned: string;
  shift_summary: string;
  priority: string;
  submitted_by: string;
  submitted_at: string;
  status: string;
  notes: string;
  assignedTo?: string;
}

export type ShiftReportInput = Omit<ShiftReport, 'id' | 'created_at' | 'submitted_by' | 'submitted_at' | 'status'>;

// Simple type for admin data
export interface AdminProfile {
  id: string;
  name: string;
  email: string;
}
