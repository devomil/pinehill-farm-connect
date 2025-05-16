
import { QueryObserverResult } from "@tanstack/react-query";

export interface NavigationState {
  navigationComplete: React.MutableRefObject<boolean>;
  navigationInProgress: React.MutableRefObject<boolean>;
  pendingNavigation: React.MutableRefObject<string | null>;
}

export interface UseTabNavigationProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  location: { pathname: string; search: string };
  navigationComplete: React.MutableRefObject<boolean>;
  refreshMessages: () => Promise<void | QueryObserverResult<any, Error>>;
  isRefreshing: React.MutableRefObject<boolean>;
  lastRefreshTime: React.MutableRefObject<number>;
}

export interface NavigationResult {
  handleTabChange: (value: string) => void;
  navigationInProgress: React.MutableRefObject<boolean>;
  loopDetected: { current: boolean };
}
