
import { useRef, useCallback } from "react";
import { createDebugContext } from "@/utils/debugUtils";

export interface NavigationStateRef {
  navigationComplete: React.MutableRefObject<boolean>;
  navigationInProgress: React.MutableRefObject<boolean>;
  pendingNavigation: React.MutableRefObject<string | null>;
}

/**
 * Manages the navigation state references for the tab system
 */
export function useNavigationStateManager(): NavigationStateRef & {
  startNavigation: () => void;
  completeNavigation: () => void;
  setPendingNavigation: (tab: string | null) => void;
  hasPendingNavigation: () => boolean;
} {
  const debug = createDebugContext('NavigationState');
  const navigationComplete = useRef<boolean>(true);
  const navigationInProgress = useRef<boolean>(false);
  const pendingNavigation = useRef<string | null>(null);

  const startNavigation = useCallback(() => {
    navigationComplete.current = false;
    navigationInProgress.current = true;
    debug.info("Navigation started");
  }, [debug]);

  const completeNavigation = useCallback(() => {
    navigationComplete.current = true;
    navigationInProgress.current = false;
    debug.info("Navigation completed");
  }, [debug]);

  const setPendingNavigation = useCallback((tab: string | null) => {
    pendingNavigation.current = tab;
    if (tab) {
      debug.info("Pending navigation set to", tab);
    }
  }, [debug]);

  const hasPendingNavigation = useCallback(() => {
    return pendingNavigation.current !== null;
  }, []);

  return {
    navigationComplete,
    navigationInProgress,
    pendingNavigation,
    startNavigation,
    completeNavigation,
    setPendingNavigation,
    hasPendingNavigation
  };
}
