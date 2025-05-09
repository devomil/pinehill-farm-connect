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
  const isCommunicationsPage = location.pathname === '/communication';
  const lastRefreshTime = useRef<number>(Date.now());
  const refreshInProgress = useRef<boolean>(false);
  
  // Pass the excludeShiftCoverage parameter to the hook
  const { data: messages, isLoading, error, refetch } = useGetCommunications(currentUser, excludeShiftCoverage);
  const sendMessageMutation = useSendMessage(currentUser);
  const respondToShiftRequestMutation = useRespondToShiftRequest(currentUser);
  
  const refreshMessages = useCallback(() => {
    const now = Date.now();
    
    // Prevent multiple refreshes within a short time period
    if (refreshInProgress.current || now - lastRefreshTime.current < 3000) { // Further reduced from 5000 to 3000ms
      console.log("Communications refresh skipped - too soon or already in progress");
      return Promise.resolve();
    }
    
    console.log("Manually refreshing communications data");
    refreshInProgress.current = true;
    lastRefreshTime.current = now;
    
    return refetch().finally(() => {
      setTimeout(() => {
        refreshInProgress.current = false;
      }, 1000); // Reduced from 3000 to 1000ms
    });
  }, [refetch]);
  
  // Process unread messages and handle admin view special cases
  const rawMessages = messages as Communication[] | null;
  const unreadMessages = useUnreadMessages(rawMessages, currentUser);

  // Check if we're on the communications page with messages tab active
  const isOnMessagesTab = isCommunicationsPage && location.search.includes('tab=messages');

  // Effect to clear unread status when viewing messages tab
  useEffect(() => {
    if (isOnMessagesTab && unreadMessages.length > 0 && currentUser) {
      console.log("On messages tab with unread messages, refreshing data");
      refreshMessages();
    }
  }, [isOnMessagesTab, unreadMessages.length, currentUser, refreshMessages]);

  const sendMessage = useCallback((params: any) => {
    console.log("Sending message with params:", JSON.stringify(params, null, 2));
    
    // Enhanced validation for shift coverage requests
    if (params.type === 'shift_coverage') {
      // Validate shift details
      if (!params.shiftDetails) {
        console.error("Missing shiftDetails object for shift coverage request");
        toast.error("Missing shift details");
        return Promise.reject(new Error("Missing shift details"));
      }
      
      const { shiftDetails } = params;
      
      if (!shiftDetails.shift_date) {
        console.error("Missing shift date");
        toast.error("Please select a date for the shift");
        return Promise.reject(new Error("Missing shift date"));
      }
      
      if (!shiftDetails.shift_start) {
        console.error("Missing shift start time");
        toast.error("Please enter a start time for the shift");
        return Promise.reject(new Error("Missing shift start time"));
      }
      
      if (!shiftDetails.shift_end) {
        console.error("Missing shift end time");
        toast.error("Please enter an end time for the shift");
        return Promise.reject(new Error("Missing shift end time"));
      }
      
      // Validate recipient
      if (!params.recipientId) {
        console.error("Missing recipient ID for shift coverage request");
        toast.error("Please select an employee to cover your shift");
        return Promise.reject(new Error("Missing recipient"));
      }
    }
    
    toast.loading("Sending message...");
    
    return sendMessageMutation.mutateAsync(params)
      .then(data => {
        console.log("Message sent successfully:", data);
        toast.dismiss();
        toast.success("Message sent successfully");
        
        // Wait a moment before refreshing to allow database operations to complete
        setTimeout(() => refreshMessages(), 500); // Reduced from 1000 to 500ms
        return data;
      })
      .catch(error => {
        console.error("Error sending message:", error);
        toast.dismiss();
        toast.error(`Failed to send message: ${error.message || "Unknown error"}`);
        throw error;
      });
  }, [sendMessageMutation, refreshMessages]);
  
  const respondToShiftRequest = useCallback((params: any) => {
    console.log("Responding to shift request:", params);
    
    toast.loading(`${params.accept ? 'Accepting' : 'Declining'} shift request...`);
    
    return respondToShiftRequestMutation.mutateAsync(params)
      .then(data => {
        console.log("Successfully responded to shift request:", data);
        toast.dismiss();
        toast.success(`You have ${params.accept ? 'accepted' : 'declined'} the shift coverage request`);
        
        // Refresh after a short delay
        setTimeout(() => refreshMessages(), 500); // Reduced from 1000 to 500ms
        return data;
      })
      .catch(error => {
        console.error("Error responding to shift request:", error);
        toast.dismiss();
        toast.error(`Failed to respond to request: ${error.message || "Unknown error"}`);
        throw error;
      });
  }, [respondToShiftRequestMutation, refreshMessages]);

  // Use a more aggressive fetch strategy for admins
  useEffect(() => {
    if (!currentUser?.id) return;
    
    // Initial fetch
    console.log(`Initial communications fetch for ${currentUser?.email}`);
    refetch();
    
    // More aggressive refresh strategy for admin users
    const isAdmin = currentUser.role === 'admin';
    const refreshInterval = window.setInterval(() => {
      const now = Date.now();
      
      // Admin users need more frequent refreshes to keep badge counts accurate
      const refreshThreshold = isAdmin ? 30000 : 45000; // 30s for admins, 45s for others
      
      if (now - lastRefreshTime.current > refreshThreshold && !refreshInProgress.current) {
        console.log(`Periodic refresh of communications data${isAdmin ? ' (admin user)' : ''}`);
        refreshInProgress.current = true;
        refetch().finally(() => {
          setTimeout(() => {
            refreshInProgress.current = false;
          }, 1000);
        });
        lastRefreshTime.current = now;
      }
    }, 30000); // Reduced from 60000 to 30000ms for all users
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [refetch, currentUser?.id, currentUser?.email, currentUser?.role]);

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
