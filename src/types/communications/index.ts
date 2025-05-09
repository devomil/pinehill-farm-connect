
// Re-export all communication types for easier imports
export * from './communicationTypes';

// Define interfaces for components
export interface NewMessageDialogProps {
  employees: Array<any>;
  onSend: (data: any) => void;
  onClose?: () => void;
  onRefresh?: () => void; // Add refresh function
}

export type MessageType = 'general' | 'shift_coverage' | 'urgent' | 'system_notification' | 'announcement';

export interface NewMessageFormData {
  recipientId: string;
  message: string;
  type: MessageType;
  shiftDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
}
