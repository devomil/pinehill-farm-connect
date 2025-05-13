
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
import { supabase } from "@/integrations/supabase/client";
import { useMessageReadingManager } from "./communications/useMessageReadingManager";
import { useMessageRefreshManager } from "./communications/useMessageRefreshManager";
import { useMessageSendOperations } from "./communications/useMessageSendOperations";

export const useCommunications = (excludeShiftCoverage = false) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  // Get communications data
  const { data: messages, isLoading, error, refetch } = useGetCommunications(currentUser, excludeShiftCoverage);
  
  // Get mutation hooks
  const sendMessageMutation = useSendMessage(currentUser);
  const respondToShiftRequestMutation = useRespondToShiftRequest(currentUser);
  
  // Get modular functionality hooks
  const { refreshMessages, lastRefreshTime, refreshInProgress } = useMessageRefreshManager(currentUser, refetch);
  const { markMessageAsRead, isMarking } = useMessageReadingManager(currentUser);
  
  // Create properly typed version of sendMessage and respondToShiftRequest
  const { sendMessage, sendBulkMessages, respondToShiftRequest } = useMessageSendOperations(
    sendMessageMutation,
    respondToShiftRequestMutation,
    refreshMessages
  );
  
  // Process message data
  const rawMessages = messages as Communication[] | null;
  const unreadMessages = useUnreadMessages(rawMessages, currentUser);
  
  // Navigation state
  const isTimeManagementPage = location.pathname === '/time';
  const isCommunicationsPage = location.pathname === '/communication';
  const isOnMessagesTab = isCommunicationsPage && location.search.includes('tab=messages');
  
  // Track mounted state to avoid unnecessary refreshes
  const isMounted = useRef(false);
  const initialFetchDone = useRef(false);
  const refreshTimeoutRef = useRef<number | null>(null);
  
  // Function to mark all messages as read
  const markAllMessagesAsRead = useCallback(async (messagesToMark: Communication[]) => {
    if (!messagesToMark || messagesToMark.length === 0) return;
    
    console.log(`Marking ${messagesToMark.length} messages as read`);
    
    // Mark each message as read one by one
    for (const message of messagesToMark) {
      if (message.id && !message.read_at) {
        await markMessageAsRead(message.id);
      }
    }
    
    // Force a data refresh after marking all messages
    refreshMessages();
  }, [markMessageAsRead, refreshMessages]);
  
  // Effect to mark all messages as read when an admin views the messages tab
  // Use a ref to track if we've already processed this condition
  const hasProcessedReadAll = useRef(false);
  
  useEffect(() => {
    if (isOnMessagesTab && currentUser?.role === 'admin' && unreadMessages.length > 0 && !hasProcessedReadAll.current) {
      console.log("Admin user on messages tab with unread messages, marking as read");
      markAllMessagesAsRead(unreadMessages);
      hasProcessedReadAll.current = true;
      
      // Reset this flag when navigating away
      return () => {
        hasProcessedReadAll.current = false;
      };
    }
  }, [isOnMessagesTab, unreadMessages, currentUser, markAllMessagesAsRead]);

  // Initial data loading
  useEffect(() => {
    if (!currentUser?.id || initialFetchDone.current) return;
    
    // Initial fetch
    console.log(`Initial communications fetch for ${currentUser?.email}`);
    refetch().then(() => {
      initialFetchDone.current = true;
    });
    
    isMounted.current = true;
    
    // Clean up function
    return () => {
      isMounted.current = false;
      if (refreshTimeoutRef.current !== null) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [refetch, currentUser?.id, currentUser?.email]);

  // Set up background refresh with reasonable intervals
  useEffect(() => {
    if (!currentUser?.id || !isMounted.current) return;
    
    // More reasonable refresh intervals
    const isAdmin = currentUser.role === 'admin';
    const refreshInterval = window.setInterval(() => {
      // Don't refresh if component is unmounted or refresh is in progress
      if (!isMounted.current || refreshInProgress.current) return;
      
      const now = Date.now();
      // Admin users need less frequent refreshes to prevent UI flashing
      const refreshThreshold = isAdmin ? 45000 : 60000; // 45s for admins, 60s for others
      
      if (now - lastRefreshTime.current > refreshThreshold) {
        console.log(`Periodic refresh of communications data${isAdmin ? ' (admin user)' : ''}`);
        refreshInProgress.current = true;
        
        refetch().finally(() => {
          // Use a timeout to prevent immediate subsequent refreshes
          refreshTimeoutRef.current = window.setTimeout(() => {
            refreshInProgress.current = false;
          }, 2000) as unknown as number;
        });
        
        lastRefreshTime.current = now;
      }
    }, isAdmin ? 60000 : 90000); // Every 60s for admins, 90s for others - increased to reduce flickering
    
    // Clear interval on unmount
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
      if (refreshTimeoutRef.current !== null) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [refetch, currentUser?.id, currentUser?.role, lastRefreshTime, refreshInProgress]);

  return {
    messages: messages || [],
    unreadMessages,
    isLoading,
    error,
    sendMessage,
    sendBulkMessages,
    respondToShiftRequest,
    refreshMessages,
    markAllMessagesAsRead
  };
};
