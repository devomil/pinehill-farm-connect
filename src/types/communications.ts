
import { User } from "@/types";

export type MessageType = 'general' | 'shift_coverage' | 'urgent';
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
  priority?: 'normal' | 'high';
}

export interface NewMessageDialogProps {
  employees: User[];
  onSend: (data: {
    recipientId: string;
    message: string;
    type: MessageType;
    shiftDetails?: {
      shift_date: string;
      shift_start: string;
      shift_end: string;
    };
  }) => void;
}

export interface MessageNotification {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: MessageType;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  shiftDetails?: ShiftDetails;
}
