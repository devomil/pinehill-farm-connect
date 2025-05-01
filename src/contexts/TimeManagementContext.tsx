
import React, { createContext, useContext, useState, useCallback } from "react";
import { User } from "@/types";
import { TimeManagementContextType, TimeManagementProviderProps } from "@/types/timeManagement";
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

  // Retry logic for failed fetches
  const handleRetry = useCallback(() => {
    setRetryCount(prevCount => prevCount + 1);
    toast.info("Retrying data fetch...");
    fetchRequests();
    refreshMessages();
  }, [fetchRequests, refreshMessages]);

  // Force refresh of data
  const forceRefreshData = useCallback(() => {
    setRetryCount(prevCount => prevCount + 1);
    fetchRequests();
    refreshMessages();
  }, [fetchRequests, refreshMessages]);

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
