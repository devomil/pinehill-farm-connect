
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { User } from "@/types";
import { TimeManagementContextType, TimeManagementProviderProps, TimeOffRequest } from "@/types/timeManagement";
import { useCommunications } from "@/hooks/useCommunications";
import { useProcessMessages } from "@/hooks/communications/useProcessMessages";
import { useTimeOffRequests } from "@/hooks/timeManagement/useTimeOffRequests";
import { toast } from "sonner";

const TimeManagementContext = createContext<TimeManagementContextType | undefined>(undefined);

export const useTimeManagement = () => {
  const context = useContext(TimeManagementContext);
  if (context === undefined) {
    throw new Error("useTimeManagement must be used within a TimeManagementProvider");
  }
  return context;
};

export const TimeManagementProvider: React.FC<TimeManagementProviderProps> = ({
  children,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState("my-requests");
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    console.log("TimeManagementProvider initialized with user:", currentUser?.id);
  }, [currentUser]);
  
  // Get time off requests data
  const {
    timeOffRequests,
    loading,
    error,
    pendingRequests,
    userRequests,
    fetchRequests
  } = useTimeOffRequests(currentUser, retryCount);
  
  // Get communications data for shift coverage requests
  const { 
    messages: rawMessages, 
    isLoading: messagesLoading, 
    error: messagesError, 
    respondToShiftRequest, 
    refreshMessages 
  } = useCommunications();
  
  const processedMessages = useProcessMessages(rawMessages, currentUser);
  
  // Additional logging for processed messages
  useEffect(() => {
    console.log("Processed messages count:", processedMessages?.length || 0);
    
    if (processedMessages && processedMessages.length > 0) {
      console.log("First processed message:", processedMessages[0]);
    }
  }, [processedMessages]);

  // Retry logic for failed fetches
  const handleRetry = useCallback(() => {
    console.log("Manual retry triggered");
    setRetryCount(prevCount => prevCount + 1);
    toast.info("Retrying data fetch...");
    fetchRequests();
    refreshMessages();
  }, [fetchRequests, refreshMessages]);

  // Force refresh of data
  const forceRefreshData = useCallback(() => {
    console.log("Force refresh triggered");
    setRetryCount(prevCount => prevCount + 1);
    fetchRequests();
    refreshMessages();
  }, [fetchRequests, refreshMessages]);
  
  // Initial data load
  useEffect(() => {
    if (currentUser) {
      console.log("Initial data load in TimeManagementProvider");
      fetchRequests();
      refreshMessages();
    }
  }, [currentUser, fetchRequests, refreshMessages]);

  const value: TimeManagementContextType = {
    timeOffRequests,
    loading,
    error,
    activeTab,
    retryCount,
    pendingRequests,
    userRequests,
    processedMessages,
    messagesLoading,
    messagesError,
    respondToShiftRequest,
    setActiveTab,
    fetchRequests,
    refreshMessages,
    forceRefreshData,
    handleRetry
  };

  return (
    <TimeManagementContext.Provider value={value}>
      {children}
    </TimeManagementContext.Provider>
  );
};
