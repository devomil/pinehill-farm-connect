
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useRefreshMessages() {
  const queryClient = useQueryClient();
  
  // Function to refresh messages with a retry parameter to prevent loops
  const refreshMessages = useCallback(() => {
    console.log("Manually refreshing messages");
    queryClient.invalidateQueries({ queryKey: ['communications'] });
    // Attempt to invalidate any cached errors
    queryClient.resetQueries({ queryKey: ['communications'] });
  }, [queryClient]);

  return refreshMessages;
}
