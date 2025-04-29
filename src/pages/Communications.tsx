
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useEmployeeAssignments } from "@/hooks/useEmployeeAssignments";
import { useCommunications } from "@/hooks/useCommunications";
import { CommunicationsLayout } from "@/components/communications/CommunicationsLayout";
import { ConversationTabs } from "@/components/communications/ConversationTabs";
import { useErrorHandling } from "@/hooks/communications/useErrorHandling";

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
    // Set a refresh interval for messages (every 30 seconds)
    const refreshInterval = setInterval(() => {
      refreshMessages();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [currentUser, refetchEmployees, refreshMessages, retryCount]);

  const handleRetryConnection = () => {
    handleRetry();
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
    error: error ? formatErrorMessage(error) : "No error"
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
