
import { useCallback } from "react";
import { createDebugContext } from "@/utils/debugUtils";

interface UseProcessPendingNavigationProps {
  pendingNavigation: React.MutableRefObject<string | null>;
  setPendingNavigation: (tab: string | null) => void;
  hasPendingNavigation: () => boolean;
  handleTabChange: (tab: string) => void;
}

/**
 * Hook to process any pending navigation requests after current navigation completes
 */
export function useProcessPendingNavigation({
  pendingNavigation,
  setPendingNavigation,
  hasPendingNavigation,
  handleTabChange,
}: UseProcessPendingNavigationProps) {
  const debug = createDebugContext('ProcessPendingNavigation');

  const processPendingNavigation = useCallback(() => {
    if (hasPendingNavigation()) {
      const nextTab = pendingNavigation.current;
      setPendingNavigation(null);
      debug.info("Processing pending navigation to", nextTab);
      
      setTimeout(() => {
        if (nextTab) {
          handleTabChange(nextTab);
        }
      }, 100);
    }
  }, [debug, pendingNavigation, setPendingNavigation, hasPendingNavigation, handleTabChange]);

  return {
    processPendingNavigation
  };
}
