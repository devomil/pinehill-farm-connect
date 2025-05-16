
import { useRef, useCallback } from "react";
import { createDebugContext } from "@/utils/debugUtils";

/**
 * Hook to manage pending navigation requests
 */
export function usePendingNavigation() {
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
