
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
  const { refreshMessages, lastRefreshTime, refreshInProgress, refreshCount, loadingToastShown } = 
    useMessageRefreshManager(currentUser, refetch);
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
  const lastBackgroundRefreshTime = useRef<number>(Date.now());
  const bgRefreshCount = useRef<number>(0);
  const MAX_BG_REFRESHES = 3;
  
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

  // Initial data loading - more conservative approach
  useEffect(() => {
    if (!currentUser?.id || initialFetchDone.current) return;
    
    // Initial fetch with delay to prevent immediate loading on mount
    console.log(`Scheduling initial communications fetch for ${currentUser?.email}`);
    
    const initialFetchTimer = setTimeout(() => {
      console.log(`Executing initial communications fetch for ${currentUser?.email}`);
      refetch().then(() => {
        initialFetchDone.current = true;
      });
    }, 1500);
    
    isMounted.current = true;
    
    // Clean up function
    return () => {
      isMounted.current = false;
      clearTimeout(initialFetchTimer);
      if (refreshTimeoutRef.current !== null) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [refetch, currentUser?.id, currentUser?.email]);

  // Set up background refresh with EXTREMELY limited frequency
  useEffect(() => {
    if (!currentUser?.id || !isMounted.current) return;
    
    // EXTREMELY less frequent refreshes to prevent UI flickering
    const isAdmin = currentUser.role === 'admin';
    
    // One-time setup for background refresh
    const backgroundRefreshTimer = window.setTimeout(() => {
      // Don't refresh if component is unmounted or refresh is in progress or max refreshes reached
      if (!isMounted.current || refreshInProgress.current || bgRefreshCount.current >= MAX_BG_REFRESHES) return;
      
      const now = Date.now();
      // Only do a background refresh if it's been at least 10 minutes
      if (now - lastBackgroundRefreshTime.current > 600000) { // 10 minutes
        console.log(`Scheduled background refresh of communications data${isAdmin ? ' (admin user)' : ''}`);
        bgRefreshCount.current++;
        lastBackgroundRefreshTime.current = now;
        
        refetch({ stale: false }).finally(() => {
          // Just mark it done, no further action needed
        });
      }
    }, isAdmin ? 600000 : 900000); // 10-15 minutes - greatly increased
    
    // Clear timeout on unmount
    return () => {
      clearTimeout(backgroundRefreshTimer);
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
