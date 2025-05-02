
import { useGetCommunications } from "./communications/useGetCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { useSendMessage } from "./communications/useSendMessage";
import { useRespondToShiftRequest } from "./communications/useRespondToShiftRequest";
import { useUnreadMessages } from "./communications/useUnreadMessages";
import { useRefreshMessages } from "./communications/useRefreshMessages";
import { Communication } from "@/types/communications/communicationTypes";
import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

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
    if (refreshInProgress.current || now - lastRefreshTime.current < 5000) { // Reduced from 10000 to 5000ms
      console.log("Communications refresh skipped - too soon or already in progress");
      return Promise.resolve();
    }
    
    console.log("Manually refreshing communications data");
    refreshInProgress.current = true;
    lastRefreshTime.current = now;
    
    return refetch().finally(() => {
      setTimeout(() => {
        refreshInProgress.current = false;
      }, 3000);
    });
  }, [refetch]);
  
  const unreadMessages = useUnreadMessages(messages as Communication[] | null, currentUser);

  const sendMessage = (params: any) => {
    console.log("Sending message with params:", JSON.stringify(params, null, 2));
    
    // Special handling for shift coverage requests
    if (params.type === 'shift_coverage') {
      if (!params.shiftDetails || 
          !params.shiftDetails.shift_date || 
          !params.shiftDetails.shift_start || 
          !params.shiftDetails.shift_end) {
        console.error("Missing required shift coverage details");
        toast.error("Missing required shift details");
        return Promise.reject(new Error("Incomplete shift details"));
      }
      
      // Validate recipient
      if (!params.recipientId) {
        console.error("Missing recipient ID for shift coverage request");
        toast.error("Please select an employee to cover your shift");
        return Promise.reject(new Error("Missing recipient"));
      }
    }
    
    return sendMessageMutation.mutateAsync(params)
      .then(data => {
        console.log("Message sent successfully:", data);
        toast.success("Message sent successfully");
        
        // Wait a moment before refreshing to allow database operations to complete
        setTimeout(() => refreshMessages(), 1000); // Reduced from 2000 to 1000ms
        return data;
      })
      .catch(error => {
        console.error("Error sending message:", error);
        toast.error(`Failed to send message: ${error.message || "Unknown error"}`);
        throw error;
      });
  };

  const respondToShiftRequest = (params: any) => {
    console.log("Responding to shift request:", params);
    
    return respondToShiftRequestMutation.mutateAsync(params)
      .then(data => {
        console.log("Successfully responded to shift request:", data);
        toast.success(`You have ${params.accept ? 'accepted' : 'declined'} the shift coverage request`);
        
        // Refresh after a short delay
        setTimeout(() => refreshMessages(), 1000); // Reduced from 2000 to 1000ms
        return data;
      })
      .catch(error => {
        console.error("Error responding to shift request:", error);
        toast.error(`Failed to respond to request: ${error.message || "Unknown error"}`);
        throw error;
      });
  };

  // Use a less aggressive fetch strategy
  useEffect(() => {
    if (!currentUser?.id) return;
    
    // Initial fetch
    console.log(`Initial communications fetch for ${currentUser?.email}`);
    refetch();
    
    // Only set up periodic refresh for time management page or if including shift coverage
    const shouldUsePeriodicRefresh = isTimeManagementPage || !excludeShiftCoverage;
    
    let refreshInterval: number | undefined;
    
    if (shouldUsePeriodicRefresh) {
      refreshInterval = window.setInterval(() => {
        const now = Date.now();
        
        if (now - lastRefreshTime.current > 45000 && !refreshInProgress.current) { // Reduced from 60000 to 45000ms
          console.log("Periodic refresh of communications data");
          refreshInProgress.current = true;
          refetch().finally(() => {
            setTimeout(() => {
              refreshInProgress.current = false;
            }, 3000);
          });
          lastRefreshTime.current = now;
        }
      }, 60000); // Reduced from 90000 to 60000ms
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
