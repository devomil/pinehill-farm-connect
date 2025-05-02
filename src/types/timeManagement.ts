
import { User } from '@/types';
import { Communication } from './communications/communicationTypes';

export interface TimeOffRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  notes?: string;
  created_at?: string;
  admin_id?: string;
}

export interface TimeManagementContextType {
  timeOffRequests: TimeOffRequest[] | null;
  loading: boolean;
  error: any;
  activeTab: string;
  pendingRequests: TimeOffRequest[] | null;
  userRequests: TimeOffRequest[] | null;
  retryCount: number;
  processedMessages: Communication[] | null;
  messagesLoading: boolean;
  messagesError: any;
  respondToShiftRequest: (data: any) => void;
  setActiveTab: (tab: string) => void;
  fetchRequests: () => void;
  refreshMessages: () => void;
  forceRefreshData: () => void;
  handleRetry: () => number;
  allEmployees?: User[] | null;
}

export interface TimeManagementProviderProps {
  children: React.ReactNode;
  currentUser: User | null;
}
