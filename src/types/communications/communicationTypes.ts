
export interface Communication {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  type: 'general' | 'shift_coverage' | 'urgent';
  created_at: string;
  status: 'pending' | 'accepted' | 'declined';
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
  status: 'pending' | 'accepted' | 'declined';
}

export interface SendMessageParams {
  recipientId: string;
  message: string;
  type: 'general' | 'shift_coverage' | 'urgent';
  shiftDetails?: Omit<ShiftCoverageRequest, 'id' | 'communication_id' | 'status'>;
}

export interface RespondToShiftRequestParams {
  communicationId: string;
  shiftRequestId: string;
  accept: boolean;
  senderId: string;
}
