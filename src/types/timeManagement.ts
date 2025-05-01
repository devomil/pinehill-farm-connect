
import { User } from "@/types";

export interface TimeOffRequest {
  id: string;
  startDate: Date;
  endDate: Date;
  status: "pending" | "approved" | "rejected";
  userId: string;
  reason?: string; // Making reason optional to match the implementation
  notes?: string;
  profiles?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TimeManagementContextType {
  timeOffRequests: TimeOffRequest[];
  loading: boolean;
  error: Error | null;
  activeTab: string;
  retryCount: number;
  pendingRequests: TimeOffRequest[];
  userRequests: TimeOffRequest[];
  processedMessages: any[];
  messagesLoading: boolean;
  messagesError: any;
  respondToShiftRequest: any;
  setActiveTab: (tab: string) => void;
  fetchRequests: () => Promise<void>;
  refreshMessages: () => void;
  forceRefreshData: () => void;
  handleRetry: () => void;
}

export interface TimeManagementProviderProps {
  children: React.ReactNode;
  currentUser: User | null;
}
