
export type MessageType = 'general' | 'shift_coverage' | 'urgent' | 'system_notification' | 'announcement';
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
  current_user_id?: string;
  
  // UI helper properties
  sender_name?: string;
  sender_display_name?: string;
  sender_email?: string;
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
  adminCc?: string;
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
