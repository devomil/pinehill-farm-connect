
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
    console.log("TimeManagementProvider initialized with user:", currentUser?.id, currentUser?.email);
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
  
  // Get communications data for shift coverage requests with enhanced logging
  const { 
    messages: rawMessages, 
    isLoading: messagesLoading, 
    error: messagesError, 
    respondToShiftRequest, 
    refreshMessages 
  } = useCommunications();
  
  // Log raw message data before processing
  useEffect(() => {
    console.log("Raw messages in TimeManagementContext:", rawMessages?.length || 0);
    
    // Check for shift coverage messages in raw data
    const shiftMessages = rawMessages?.filter(msg => msg.type === 'shift_coverage') || [];
    console.log("Raw shift coverage messages count:", shiftMessages.length);
    
    if (shiftMessages.length > 0) {
      console.log("Sample raw shift message:", {
        id: shiftMessages[0].id,
        sender: shiftMessages[0].sender_id,
        recipient: shiftMessages[0].recipient_id,
        type: shiftMessages[0].type,
        shiftRequests: shiftMessages[0].shift_coverage_requests?.length || 0
      });
    }
  }, [rawMessages]);
  
  // Process messages with the enhanced hook
  const processedMessages = useProcessMessages(rawMessages, currentUser);
  
  // Additional logging for processed messages
  useEffect(() => {
    console.log("Processed messages in TimeManagementContext:", processedMessages?.length || 0);
    
    if (processedMessages && processedMessages.length > 0) {
      // Check for shift coverage messages specifically
      const shiftMessages = processedMessages.filter(msg => msg.type === 'shift_coverage');
      console.log("Processed shift coverage messages:", shiftMessages.length);
      
      if (shiftMessages.length > 0) {
        console.log("First processed shift message:", {
          id: shiftMessages[0].id,
          sender: shiftMessages[0].sender_id,
          recipient: shiftMessages[0].recipient_id,
          requests: shiftMessages[0].shift_coverage_requests?.length || 0
        });
        
        // Check if any are relevant to current user
        const relevantToUser = shiftMessages.filter(msg => 
          msg.sender_id === currentUser?.id || msg.recipient_id === currentUser?.id
        );
        console.log(`Shift messages relevant to user ${currentUser?.email}:`, relevantToUser.length);
      }
    }
  }, [processedMessages, currentUser]);

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
      console.log("Initial data load in TimeManagementProvider for:", currentUser.email);
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
