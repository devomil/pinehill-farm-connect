
import { User } from "@/types";

export type MessageType = 'general' | 'shift_coverage';
export type MessageStatus = 'pending' | 'accepted' | 'declined';

export interface ShiftDetails {
  shift_date: string;
  shift_start: string;
  shift_end: string;
}

export interface NewMessageFormData {
  recipientId: string;
  message: string;
  type: MessageType;
  shiftDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
}

export interface NewMessageDialogProps {
  employees: User[];
  onSend: any;
}
