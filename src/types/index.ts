export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  department?: string;
  position?: string;
  avatar_url?: string;
  created_at?: string;
  employeeId?: string; // Added employeeId field
}

export interface EmployeeHR {
  id: string;
  userId: string;
  startDate?: Date;
  endDate?: Date;
  salary?: number;
  employmentType?: "" | "full-time" | "part-time" | "contract" | "seasonal" | "intern";
  address?: string;
  phone?: string;
  emergencyContact?: string;
  notes?: string;
}

export interface UserRole {
  id: string;
  userId: string;
  role: "admin" | "employee" | "hr" | "manager";
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: "planning" | "active" | "completed" | "on-hold";
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  manager?: string;
  client?: string;
  priority?: "low" | "medium" | "high";
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "review" | "done";
  assignee?: string;
  dueDate?: Date;
  priority?: "low" | "medium" | "high";
  estimatedHours?: number;
  actualHours?: number;
}

export interface TimeEntry {
  id: string;
  userId: string;
  taskId?: string;
  projectId?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  date: Date;
  billable: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
  link?: string;
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
  requires_acknowledgment?: boolean;
  attachments?: Array<{
    name: string;
    type: string;
    url?: string;
    size?: number;
  }>;
  target_type?: "all" | "specific";
  acknowledgements?: string[];
  currentUserId?: string;
}

export interface TimeOffRequest {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  category: "CBD101" | "HIPAA" | "SaltGenerator" | "OpeningClosing" | "Other";
  duration: number;  // in minutes
  requiredFor: string[];
  expiresAfter?: number;  // in days
  hasQuiz?: boolean;
  attachments?: Array<{
    name: string;
    type: string;
    url?: string;
  }>;
  external_test_url?: string;
}

export interface TrainingProgress {
  id: string;
  userId: string;
  trainingId: string;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  passed?: boolean;
  lastAttempt?: Date;
  status: "not-started" | "in-progress" | "completed" | "failed" | "expired";
}
