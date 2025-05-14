
import { User } from "@/types";

export interface TeamCalendarProps {
  currentUser: User;
}

export type CalendarItem = {
  id: string;
  type: "event";
  label: string;
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

export interface TeamCalendarEventFormProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  onEventCreated: () => void;
  currentUser: User;
}
