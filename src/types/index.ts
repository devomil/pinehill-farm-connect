export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  department?: string;
  position?: string;
  avatar_url?: string;
  created_at?: string;
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
