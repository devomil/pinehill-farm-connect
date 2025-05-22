
export interface CompanyEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_by: string;
  attendance_type: string;
  attachments: string[];
}

export interface CalendarItem {
  id: string;
  type: "event" | "time-off" | "shift";
  label: string;
  startDate: Date;
  endDate: Date;
  attendanceType?: string;
  attachments?: string[];
}

// Add missing interfaces
export interface TeamCalendarProps {
  currentUser: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
  };
}

export interface TeamCalendarHeaderProps extends TeamCalendarProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  onEventCreated: () => void;
}

export interface TeamCalendarEventFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onEventCreated: () => void;
  currentUser: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
  };
}
