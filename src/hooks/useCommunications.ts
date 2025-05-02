
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
    
    // CRITICAL FIX: Improved throttling to prevent multiple refreshes within a short time period
    if (refreshInProgress.current || now - lastRefreshTime.current < 8000) { // Increased to 8000ms
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
    }, 5000); // Increased to 5000ms for more breathing room between refreshes
    
    return result;
  }, [refetch]);
  
  const unreadMessages = useUnreadMessages(messages as Communication[] | null, currentUser);

  // CRITICAL FIX: Enhanced send message function to better handle shift coverage requests
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
      
      // Log data being sent
      console.log("Original employee ID:", params.shiftDetails.original_employee_id);
      console.log("Covering employee ID:", params.shiftDetails.covering_employee_id);
    }
    
    return sendMessageMutation.mutate(params, {
      onSuccess: (data) => {
        console.log("Message sent successfully, response:", data);
        // Add a longer delay before refreshing to allow DB operations to complete
        setTimeout(() => refreshMessages(), 2000);
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
        // Add a delay before refreshing
        setTimeout(() => refreshMessages(), 2000);
      },
      onError: (error) => {
        console.error("Error responding to shift request:", error);
      }
    });
  };

  // CRITICAL FIX: Use a less aggressive fetch strategy with longer intervals
  useEffect(() => {
    if (!currentUser?.id) return;
    
    // Initial fetch
    console.log(`Initial communications fetch for ${currentUser?.email}`);
    refetch();
    
    // Only set up periodic refresh for time management page or if we're including shift coverage messages
    const shouldUsePeriodicRefresh = isTimeManagementPage || !excludeShiftCoverage;
    
    let refreshInterval: number | undefined;
    
    if (shouldUsePeriodicRefresh) {
      // Use a much longer interval for periodic refreshes
      refreshInterval = window.setInterval(() => {
        const now = Date.now();
        
        // Only refresh if sufficient time has passed since the last refresh
        if (now - lastRefreshTime.current > 60000 && !refreshInProgress.current) {  // Increased to 60000ms (1 minute)
          console.log("Periodic refresh of communications data");
          refreshInProgress.current = true;
          refetch().finally(() => {
            setTimeout(() => {
              refreshInProgress.current = false;
            }, 5000);
          });
          lastRefreshTime.current = now;
        }
      }, 120000); // Increased to 120000ms (2 minutes) - Check less frequently
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
