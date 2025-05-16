
import { useRef, useCallback } from "react";
import { createDebugContext } from "@/utils/debugUtils";
import { NavigationState } from "./types";

/**
 * Hook that provides navigation state refs
 */
export function useNavigationState(): NavigationState & {
  startNavigation: () => void;
  completeNavigation: () => void;
} {
  const debug = createDebugContext('NavigationState');
  const navigationComplete = useRef<boolean>(true);
  const navigationInProgress = useRef<boolean>(false);

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

  return {
    navigationComplete,
    navigationInProgress,
    startNavigation,
    completeNavigation
  };
}
