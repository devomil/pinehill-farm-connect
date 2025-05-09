
import { User } from "@/types";

export interface MessageData {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  type: 'general' | 'shift_coverage' | 'urgent' | 'system_notification' | 'announcement';
  created_at: string;
  status: 'pending' | 'accepted' | 'declined';
  read_at: string | null;
  admin_cc?: string | null;
  shift_coverage_requests?: ShiftCoverageRequest[];
  current_user_id?: string;
}

export interface ShiftCoverageRequest {
  id: string;
  communication_id: string;
  original_employee_id?: string;
  covering_employee_id?: string;
  shift_date: string;
  shift_start: string;
  shift_end: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at?: string;
  updated_at?: string;
}

export interface MessageListProps {
  messages: MessageData[];
  isLoading: boolean;
  onRespond: (data: {
    communicationId: string;
    shiftRequestId: string;
    accept: boolean;
    senderId: string;
  }) => void;
  employees: User[];
  onViewConversation: (employee: User) => void;
}

export interface MessageItemProps {
  message: MessageData;
  recipient: User;
  isOutgoing: boolean;
  onRespond: (data: {
    communicationId: string;
    shiftRequestId: string;
    accept: boolean;
    senderId: string;
  }) => void;
  onViewConversation?: () => void;
}
