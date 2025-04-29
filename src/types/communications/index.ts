
// Re-export all communication types for easier imports
export * from './communicationTypes';

// Define interfaces for components
export interface NewMessageDialogProps {
  employees: Array<any>;
  onSend: (data: any) => void;
  onClose?: () => void;
}

export type MessageType = 'general' | 'shift_coverage';

export interface NewMessageFormData {
  recipientId: string;
  message: string;
  type: MessageType;
  shiftDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
}
