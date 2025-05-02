
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";
import { TimeOffRequest } from "@/types/timeManagement";

export interface TimeManagementState {
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
  allEmployees?: User[] | null;
}

export interface TimeManagementActions {
  respondToShiftRequest: (data: any) => void;
  setActiveTab: (tab: string) => void;
  fetchRequests: () => void;
  refreshMessages: () => void;
  forceRefreshData: () => void;
  handleRetry: () => number;
}

export interface TimeManagementContextType extends TimeManagementState, TimeManagementActions {}

export interface TimeManagementProviderProps {
  children: React.ReactNode;
  currentUser: User | null;
}
