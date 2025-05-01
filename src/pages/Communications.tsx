
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useEmployeeAssignments } from "@/hooks/useEmployeeAssignments";
import { useCommunications } from "@/hooks/useCommunications";
import { CommunicationsLayout } from "@/components/communications/CommunicationsLayout";
import { ConversationTabs } from "@/components/communications/ConversationTabs";
import { useErrorHandling } from "@/hooks/communications/useErrorHandling";
import { toast } from "sonner";
import { Communication } from "@/types/communications/communicationTypes";

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
    
    // Immediately fetch fresh data when the component mounts
    refetchEmployees();
    refreshMessages();
    
    // Set up refresh interval for regular updates
    const refreshInterval = setInterval(() => {
      console.log("Auto-refreshing communications data");
      refetchEmployees();  // Refresh employee data too to keep recipient lists current
      refreshMessages();
    }, 30000); // Refresh every 30 seconds (increased frequency)
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [currentUser, refetchEmployees, refreshMessages]);

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
  
  // Process and type-cast messages for proper type compatibility
  const processedMessages = React.useMemo(() => {
    if (!safeMessages.length) return [];
    
    return safeMessages.map(msg => {
      // Cast message type to proper union type
      const messageType = ['general', 'shift_coverage', 'urgent'].includes(msg.type) 
        ? msg.type as 'general' | 'shift_coverage' | 'urgent'
        : 'general' as const;
      
      // Cast message status to proper union type
      const messageStatus = ['pending', 'accepted', 'declined'].includes(msg.status)
        ? msg.status as 'pending' | 'accepted' | 'declined'
        : 'pending' as const;
      
      // Process shift coverage requests to ensure they have proper types
      const typedShiftRequests = msg.shift_coverage_requests?.map(req => {
        return {
          ...req,
          status: ['pending', 'accepted', 'declined'].includes(req.status)
            ? req.status as 'pending' | 'accepted' | 'declined'
            : 'pending' as const
        };
      });
      
      // Add current user ID to each message for easier processing in child components
      return {
        ...msg,
        type: messageType,
        status: messageStatus,
        shift_coverage_requests: typedShiftRequests,
        current_user_id: currentUser ? currentUser.id : undefined
      } as unknown as Communication;
    });
  }, [safeMessages, currentUser]);

  return (
    <CommunicationsLayout
      error={error}
      loading={loading}
      isConnectionError={isConnectionError(error)}
      onRetry={handleRetryConnection}
      retryCount={retryCount}
      onRefresh={handleManualRefresh} // Pass the new refresh function
    >
      {!loading && (
        <ConversationTabs
          messages={processedMessages}
          loading={loading}
          unreadMessages={unreadMessages || []}
          employees={allEmployees || []}
          onRespond={respondToShiftRequest}
          onSendMessage={sendMessage}
          onRefresh={handleManualRefresh} // Pass the refresh function to tabs
        />
      )}
    </CommunicationsLayout>
  );
}
