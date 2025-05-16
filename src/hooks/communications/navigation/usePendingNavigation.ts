
import { useRef, useCallback } from "react";
import { createDebugContext } from "@/utils/debugUtils";
import { PendingNavigationState } from "./types";

/**
 * Hook to manage pending navigation requests
 */
export function usePendingNavigation(): PendingNavigationState & {
  setPendingNavigation: (tab: string | null) => void;
  hasPendingNavigation: () => boolean;
} {
  const debug = createDebugContext('PendingNavigation');
  const pendingNavigation = useRef<string | null>(null);

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
    pendingNavigation,
    setPendingNavigation,
    hasPendingNavigation
  };
}
