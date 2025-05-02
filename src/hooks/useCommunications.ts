
import { useGetCommunications } from "./communications/useGetCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { useSendMessage } from "./communications/useSendMessage";
import { useRespondToShiftRequest } from "./communications/useRespondToShiftRequest";
import { useUnreadMessages } from "./communications/useUnreadMessages";
import { useRefreshMessages } from "./communications/useRefreshMessages";
import { Communication } from "@/types/communications/communicationTypes";
import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";

export const useCommunications = (excludeShiftCoverage = false) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const isTimeManagementPage = location.pathname === '/time';
  const lastRefreshTime = useRef<number>(Date.now());
  const refreshInProgress = useRef<boolean>(false);
  
  // Pass the excludeShiftCoverage parameter to the hook
  const { data: messages, isLoading, error, refetch } = useGetCommunications(currentUser, excludeShiftCoverage);
  const sendMessageMutation = useSendMessage(currentUser);
  const respondToShiftRequestMutation = useRespondToShiftRequest(currentUser);
  
  const refreshMessages = useCallback(() => {
    const now = Date.now();
    
    // Prevent multiple refreshes within a short time period
    if (refreshInProgress.current || now - lastRefreshTime.current < 5000) { // Increased from 3000 to 5000ms
      console.log("Communications refresh skipped - too soon or already in progress");
      return Promise.resolve();
    }
    
    console.log("Manually refreshing communications data");
    refreshInProgress.current = true;
    lastRefreshTime.current = now;
    
    const result = refetch();
    
    // Reset the refresh lock after a timeout
    setTimeout(() => {
      refreshInProgress.current = false;
    }, 3000); // Increased from 2000 to 3000ms
    
    return result;
  }, [refetch]);
  
  const unreadMessages = useUnreadMessages(messages as Communication[] | null, currentUser);

  // Enhanced send message function with better logging
  const sendMessage = (params: any) => {
    console.log("Sending message with params:", JSON.stringify(params, null, 2));
    
    // Special handling for shift coverage requests to ensure they're properly saved
    if (params.type === 'shift_coverage' && params.shiftDetails) {
      console.log("Processing shift coverage request with details:", params.shiftDetails);
      
      // Validate shift details are complete before sending
      if (!params.shiftDetails.shift_date || !params.shiftDetails.shift_start || !params.shiftDetails.shift_end) {
        console.error("Missing required shift coverage details");
        return Promise.reject("Incomplete shift details");
      }
    }
    
    return sendMessageMutation.mutate(params, {
      onSuccess: (data) => {
        console.log("Message sent successfully, response:", data);
        // Add a small delay before refreshing to allow DB operations to complete
        setTimeout(() => refreshMessages(), 1000);
      },
      onError: (error) => {
        console.error("Error sending message:", error);
      }
    });
  };

  const respondToShiftRequest = (params: any) => {
    console.log("Responding to shift request with params:", params);
    return respondToShiftRequestMutation.mutate(params, {
      onSuccess: () => {
        console.log("Successfully responded to shift request, refreshing messages");
        // Add a small delay before refreshing
        setTimeout(() => refreshMessages(), 1000);
      },
      onError: (error) => {
        console.error("Error responding to shift request:", error);
      }
    });
  };

  // Use a less aggressive fetch strategy with conditional refresh
  useEffect(() => {
    if (!currentUser?.id) return;
    
    // Initial fetch
    console.log(`Initial communications fetch for ${currentUser?.email}`);
    refetch();
    
    // Only set up periodic refresh for time management page or if we're including shift coverage messages
    const shouldUsePeriodicRefresh = isTimeManagementPage || !excludeShiftCoverage;
    
    let refreshInterval: number | undefined;
    
    if (shouldUsePeriodicRefresh) {
      // Use a longer interval for periodic refreshes
      refreshInterval = window.setInterval(() => {
        const now = Date.now();
        
        // Only refresh if sufficient time has passed since the last refresh
        if (now - lastRefreshTime.current > 30000 && !refreshInProgress.current) {  // Increased from 15000 to 30000ms
          console.log("Periodic refresh of communications data");
          refreshInProgress.current = true;
          refetch().finally(() => {
            setTimeout(() => {
              refreshInProgress.current = false;
            }, 3000);
          });
          lastRefreshTime.current = now;
        }
      }, 60000); // Increased from 30000 to 60000ms - Check every 60 seconds, but only refresh if needed
    }
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [refetch, currentUser?.id, currentUser?.email, isTimeManagementPage, excludeShiftCoverage]);

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
