
export interface User {
  id: string;
  name: string;
  email: string;
  role: "employee" | "admin" | "hr" | "manager";
  profileImage?: string;
  department?: string;
  position?: string;
}

export interface UserRole {
  id: string;
  userId: string;
  role: "employee" | "admin" | "hr" | "manager";
}

export interface EmployeeHR {
  id: string;
  userId: string;
  startDate?: Date;
  endDate?: Date;
  salary?: number;
  employmentType?: string;
  address?: string;
  phone?: string;
  emergencyContact?: string;
  notes?: string;
}

export interface TimeOffRequest {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  category: "CBD101" | "HIPAA" | "SaltGenerator" | "OpeningClosing" | "Other";
  requiredFor: string[];
  duration: number; // in minutes
  expiresAfter?: number; // days until recertification needed
}

export interface TrainingProgress {
  userId: string;
  trainingId: string;
  completed: boolean;
  completedDate?: Date;
  score?: number;
  expirationDate?: Date;
  certificateUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  author: string;
  priority: "urgent" | "important" | "fyi";
  readBy: string[];
  hasQuiz?: boolean;
  attachments?: string[];
}

export interface ShiftReport {
  id: string;
  userId: string;
  date: Date;
  category: "maintenance" | "inventory" | "customer" | "other";
  title: string;
  description: string;
  images?: string[];
  documents?: string[];
  assignedTo?: string[];
  status: "new" | "in-progress" | "resolved";
}
