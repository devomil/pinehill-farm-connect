
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

// Update the interface to make email required, matching the User type
export interface TeamCalendarProps {
  currentUser: {
    id: string;
    email: string;  // Now required
    name?: string;
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
    email: string;  // Now required
    name?: string;
    role?: string;
  };
}
