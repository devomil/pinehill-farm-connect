
import { useGetCommunications } from "./communications/useGetCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { useSendMessage } from "./communications/useSendMessage";
import { useRespondToShiftRequest } from "./communications/useRespondToShiftRequest";
import { useUnreadMessages } from "./communications/useUnreadMessages";
import { useRefreshMessages } from "./communications/useRefreshMessages";
import { Communication } from "@/types/communications/communicationTypes";
import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

export const useCommunications = (excludeShiftCoverage = false) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const isTimeManagementPage = location.pathname === '/time';
  
  // Pass the excludeShiftCoverage parameter to the hook
  const { data: messages, isLoading, error, refetch } = useGetCommunications(currentUser, excludeShiftCoverage);
  const sendMessageMutation = useSendMessage(currentUser);
  const respondToShiftRequestMutation = useRespondToShiftRequest(currentUser);
  const refreshMessages = useCallback(() => {
    console.log("Manually refreshing communications data");
    return refetch();
  }, [refetch]);
  
  const unreadMessages = useUnreadMessages(messages as Communication[] | null, currentUser);

  const sendMessage = (params: any) => {
    console.log("Sending message with params:", params);
    return sendMessageMutation.mutate(params);
  };

  const respondToShiftRequest = (params: any) => {
    console.log("Responding to shift request with params:", params);
    return respondToShiftRequestMutation.mutate(params, {
      onSuccess: () => {
        console.log("Successfully responded to shift request, refreshing messages");
        refreshMessages();
      }
    });
  };

  // Use a less aggressive fetch strategy with conditional refresh
  useEffect(() => {
    // Initial fetch
    console.log(`Initial communications fetch for ${currentUser?.email}`);
    refetch();
    
    // Only set up periodic refresh for time management page or if we're including shift coverage messages
    const shouldUsePeriodicRefresh = isTimeManagementPage || !excludeShiftCoverage;
    
    let refreshInterval: number | undefined;
    
    if (shouldUsePeriodicRefresh) {
      refreshInterval = window.setInterval(() => {
        console.log("Periodic refresh of communications data");
        refetch();
      }, 30000); // Refresh every 30 seconds (increased from 15s)
    }
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [refetch, currentUser?.email, isTimeManagementPage, excludeShiftCoverage]);

  return {
    messages: messages || [],
    unreadMessages,
    isLoading,
    error,
    sendMessage,
    respondToShiftRequest,
    refreshMessages
  };
};
