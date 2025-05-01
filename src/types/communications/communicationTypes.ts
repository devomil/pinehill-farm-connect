
export type MessageType = 'general' | 'shift_coverage' | 'urgent';
export type MessageStatus = 'pending' | 'accepted' | 'declined';

export interface Communication {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  type: MessageType;
  created_at: string;
  status: MessageStatus;
  read_at: string | null;
  admin_cc: string | null;
  shift_coverage_requests?: ShiftCoverageRequest[];
}

export interface ShiftCoverageRequest {
  id: string;
  communication_id: string;
  original_employee_id: string;
  covering_employee_id: string;
  shift_date: string;
  shift_start: string;
  shift_end: string;
  status: MessageStatus;
  created_at?: string;
  updated_at?: string;
}

export interface SendMessageParams {
  recipientId: string;
  message: string;
  type: MessageType;
  shiftDetails?: {
    original_employee_id: string;
    covering_employee_id: string; 
    shift_date: string;
    shift_start: string;
    shift_end: string;
  };
}

export interface RespondToShiftRequestParams {
  communicationId: string;
  shiftRequestId: string;
  accept: boolean;
  senderId: string;
}
