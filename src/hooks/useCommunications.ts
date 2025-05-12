
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
  useEffect(() => {
    if (isOnMessagesTab && currentUser && currentUser.role === 'admin' && unreadMessages.length > 0) {
      markAllMessagesAsRead(unreadMessages);
      
      // Force refresh to update all UI indicators
      setTimeout(() => refreshMessages(), 500);
      setTimeout(() => refreshMessages(), 1500);
    }
  }, [isOnMessagesTab, unreadMessages, currentUser, refreshMessages, markAllMessagesAsRead]);

  // Effect to clear unread status when viewing messages tab
  useEffect(() => {
    if (isOnMessagesTab && unreadMessages.length > 0 && currentUser) {
      console.log("On messages tab with unread messages, refreshing data");
      refreshMessages();
      
      // For admin users, do an additional refresh after a delay
      if (currentUser.role === 'admin') {
        setTimeout(() => refreshMessages(), 2000);
      }
    }
  }, [isOnMessagesTab, unreadMessages.length, currentUser, refreshMessages]);

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
      const refreshThreshold = isAdmin ? 20000 : 45000; // 20s for admins, 45s for others
      
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
    }, isAdmin ? 20000 : 30000); // Reduced to 20s for admins, 30s for others
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [refetch, currentUser?.id, currentUser?.email, currentUser?.role, lastRefreshTime, refreshInProgress]);

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
