
import { User } from "@/types";

export interface MessageData {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  type: string;
  created_at: string;
  status: string;
  read_at: string | null;
  shift_coverage_requests?: ShiftCoverageRequest[];
  current_user_id?: string;
}

export interface ShiftCoverageRequest {
  id: string;
  communication_id: string;
  shift_date: string;
  shift_start: string;
  shift_end: string;
  status: string;
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
