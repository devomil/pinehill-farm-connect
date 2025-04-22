
import { User } from "@/types";

export interface TeamCalendarProps {
  currentUser: User;
}

export type CalendarItem = {
  id: string;
  type: "timeoff" | "event";
  label: string;
  status?: "pending" | "approved" | "rejected";
  startDate: Date;
  endDate: Date;
  attachments?: string[];
  attendanceType?: "required" | "optional" | "would-like" | "info-only";
};

export type CompanyEvent = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_by: string;
  attachments?: string[];
  attendance_type: "required" | "optional" | "would-like" | "info-only";
};
