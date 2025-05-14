
import { useState, useRef, useEffect } from "react";
import { User } from "@/types";

/**
 * Hook to track initial data loading state
 */
export const useInitialLoad = (currentUser: User | null) => {
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const initialLoadRef = useRef<boolean>(false);
  
  // When user becomes available, mark initial load as needed
  useEffect(() => {
    if (currentUser && !initialLoadDone) {
      console.log("Initial load needed for user:", currentUser.email);
    }
  }, [currentUser, initialLoadDone]);
  
  return {
    initialLoadDone,
    setInitialLoadDone,
    initialLoadRef
  };
};
