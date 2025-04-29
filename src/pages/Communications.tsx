
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useEmployeeAssignments } from "@/hooks/useEmployeeAssignments";
import { useCommunications } from "@/hooks/useCommunications";
import { CommunicationsLayout } from "@/components/communications/CommunicationsLayout";
import { ConversationTabs } from "@/components/communications/ConversationTabs";
import { useErrorHandling } from "@/hooks/communications/useErrorHandling";
import { toast } from "sonner";

export default function Communications() {
  const { currentUser } = useAuth();
  const { loading: employeesLoading, error: employeeError, refetch: refetchEmployees, unfilteredEmployees: allEmployees } = useEmployeeDirectory();
  const { isLoading: assignmentsLoading } = useEmployeeAssignments();
  const { messages, isLoading: messagesLoading, respondToShiftRequest, sendMessage, unreadMessages, refreshMessages, error: messagesError } = useCommunications();
  const { retryCount, handleRetry, isConnectionError, formatErrorMessage } = useErrorHandling();
  
  const loading = employeesLoading || assignmentsLoading || messagesLoading;
  const error = employeeError || messagesError; // Combine errors from both hooks

  useEffect(() => {
    console.log("Communications page loaded with user:", currentUser?.email);
    // Attempt to load employees when page loads
    refetchEmployees();
    
    // Only set up refresh interval if there's no error
    let refreshInterval;
    if (!error) {
      refreshInterval = setInterval(() => {
        console.log("Auto-refreshing messages");
        refreshMessages();
      }, 60000); // Refresh every minute instead of continuously
    }
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [currentUser, refetchEmployees, refreshMessages, error]);

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

  // Debug information
  console.log({
    currentUser: currentUser?.id,
    employeesCount: allEmployees?.length || 0,
    messagesCount: messages?.length || 0,
    unreadCount: unreadMessages?.length || 0,
    isLoading: loading,
    retryCount,
    error: error ? formatErrorMessage(error) : "No error",
    isConnectionError: isConnectionError(error)
  });

  // Ensure messages is always an array even if it's undefined
  const safeMessages = messages || [];
  
  // Add current user ID to each message for easier processing in child components
  const messagesWithCurrentUser = currentUser ? safeMessages.map(msg => ({
    ...msg,
    current_user_id: currentUser.id
  })) : safeMessages;

  return (
    <CommunicationsLayout
      error={error}
      loading={loading}
      isConnectionError={isConnectionError(error)}
      onRetry={handleRetryConnection}
      retryCount={retryCount}
    >
      {!loading && (
        <ConversationTabs
          messages={messagesWithCurrentUser}
          loading={loading}
          unreadMessages={unreadMessages || []}
          employees={allEmployees || []}
          onRespond={respondToShiftRequest}
          onSendMessage={sendMessage}
        />
      )}
    </CommunicationsLayout>
  );
}
