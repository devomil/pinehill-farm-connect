
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";

export interface TimeManagementProviderProps {
  children: React.ReactNode;
  currentUser: User | null;
}

export interface TimeManagementContextType {
  // State
  timeOffRequests: any[];
  loading: boolean;
  error: any;
  activeTab: string;
  retryCount: number;
  pendingRequests: any[];
  userRequests: any[];
  processedMessages: Communication[];
  messagesLoading: boolean;
  messagesError: any;
  allEmployees: User[];
  lastSaveTime: number;

  // Actions
  respondToShiftRequest: (data: {
    communicationId: string;
    shiftRequestId: string;
    accept: boolean;
    senderId: string;
  }) => Promise<any>;
  setActiveTab: (tab: string) => void;
  fetchRequests: () => Promise<any>;
  refreshMessages: () => Promise<any>;
  forceRefreshData: () => void;
  handleRetry: () => number;
  setLastSaveTime: (time: number) => void;
}
