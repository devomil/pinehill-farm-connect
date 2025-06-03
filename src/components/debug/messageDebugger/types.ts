
import { User } from '@/types';
import { Communication } from '@/types/communications/communicationTypes';

export interface MessageDebuggerProps {
  selectedEmployee: User | null;
  messages: Communication[];
  filteredMessages: Communication[];
  currentUser: User | null;
  isLoading: boolean;
  navigationState?: {
    activeTab?: string;
    navigationInProgress?: boolean;
    navigationComplete?: boolean;
    loopDetected?: boolean;
    tabSwitchCount?: number;
  };
  error?: any;
}

export interface NavigationState {
  activeTab?: string;
  navigationInProgress?: boolean;
  navigationComplete?: boolean;
  loopDetected?: boolean;
  tabSwitchCount?: number;
}
