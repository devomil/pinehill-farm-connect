
import { User } from "@/types";

export interface FormValues {
  date: string;
  notes: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
}

export interface UseShiftReportFormProps {
  currentUser: User | null;
  assignableEmployees: User[];
}
