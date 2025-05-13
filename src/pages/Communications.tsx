import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useEmployeeAssignments } from "@/hooks/useEmployeeAssignments";
import { useCommunications } from "@/hooks/useCommunications";
import { CommunicationsLayout } from "@/components/communications/CommunicationsLayout";
import { ConversationTabs } from "@/components/communications/ConversationTabs";
import { useErrorHandling } from "@/hooks/communications/useErrorHandling";
import { toast } from "sonner";
import { useProcessMessages } from "@/hooks/communications/useProcessMessages";
import { useLocation, useNavigate } from "react-router-dom";

export default function Communications() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { loading: employeesLoading, error: employeeError, refetch: refetchEmployees, unfilteredEmployees: allEmployees } = useEmployeeDirectory();
  const { isLoading: assignmentsLoading } = useEmployeeAssignments();
  // Exclude shift coverage messages from the communications page
  const { messages, isLoading: messagesLoading, respondToShiftRequest, sendMessage, unreadMessages, refreshMessages, error: messagesError } = useCommunications(true);
  const { retryCount, handleRetry, isConnectionError, formatErrorMessage } = useErrorHandling();
  const [searchQuery, setSearchQuery] = useState("");
  
  const loading = employeesLoading || assignmentsLoading || messagesLoading;
  const error = employeeError || messagesError;

  // Use our common processing hook to ensure proper types
  const processedMessages = useProcessMessages(messages, currentUser);
  
  // Check if messages tab is active
  const isMessagesTabActive = location.search.includes('tab=messages');

  // Redirect to new Communication page
  useEffect(() => {
    // Redirect to the new communication page with proper tab
    const redirectPath = isMessagesTabActive 
      ? '/communication?tab=messages' 
      : '/communication';
      
    navigate(redirectPath, { replace: true });
  }, [navigate, isMessagesTabActive]);

  // Debug log for search functionality
  useEffect(() => {
    console.log("Current search query:", searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    console.log("Communications page loaded with user:", currentUser?.email);
    
    // Immediately fetch fresh data when the component mounts
    refetchEmployees();
    refreshMessages();
    
    // Set up refresh interval for regular updates
    const refreshInterval = setInterval(() => {
      console.log("Auto-refreshing communications data");
      refetchEmployees();
      refreshMessages();
    }, 30000); // Refresh every 30 seconds (decreased from 60s)
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [currentUser, refetchEmployees, refreshMessages]);
  
  // Special effect for messages tab to ensure we refresh data when viewing messages
  useEffect(() => {
    if (isMessagesTabActive && unreadMessages && unreadMessages.length > 0 && currentUser) {
      console.log("Messages tab is active with unread messages, refreshing data");
      
      // For admin users, refresh several times to ensure all badge counts are updated
      if (currentUser?.role === 'admin') {
        refreshMessages();
        setTimeout(() => refreshMessages(), 1000);
        setTimeout(() => refreshMessages(), 3000);
      } else {
        refreshMessages();
      }
    }
  }, [isMessagesTabActive, unreadMessages, refreshMessages, currentUser]);

  // Only attempt auto-retry when connection errors occur and limit to 3 attempts
  useEffect(() => {
    if (isConnectionError(error) && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log("Auto-retrying connection");
        handleRetryConnection();
      }, 5000 * (retryCount + 1)); // Exponential backoff
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, isConnectionError]);

  const handleRetryConnection = () => {
    const newRetryCount = handleRetry();
    toast.info(`Retrying connection (attempt ${newRetryCount})...`);
    refetchEmployees();
    refreshMessages();
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    toast.info("Refreshing employee and message data...");
    refetchEmployees();
    refreshMessages();
    
    // For admin users, do multiple refreshes with slight delays
    if (currentUser?.role === 'admin') {
      setTimeout(() => refreshMessages(), 1000);
    }
  };

  // Handle search query changes
  const handleSearchQueryChange = (query: string) => {
    console.log("Setting search query to:", query);
    setSearchQuery(query);
  };

  // Adapter for respondToShiftRequest that matches the expected signature
  const handleRespondToShiftRequest = (messageId: string, response: string) => {
    // Parse the messageId which contains both communicationId and shiftRequestId
    const [communicationId, shiftRequestId, senderId] = messageId.split('|');
    
    return respondToShiftRequest({
      communicationId,
      shiftRequestId,
      accept: response === 'accepted',
      senderId
    });
  };

  return (
    <CommunicationsLayout
      error={error}
      loading={loading}
      isConnectionError={isConnectionError(error)}
      onRetry={handleRetryConnection}
      retryCount={retryCount}
      onRefresh={handleManualRefresh}
    >
      {!loading && (
        <ConversationTabs
          messages={processedMessages}
          loading={loading}
          unreadMessages={unreadMessages || []}
          employees={allEmployees || []}
          onRespond={handleRespondToShiftRequest}
          onSendMessage={sendMessage}
          onRefresh={handleManualRefresh}
          searchQuery={searchQuery}
          onSearchChange={handleSearchQueryChange}
        />
      )}
    </CommunicationsLayout>
  );
}
