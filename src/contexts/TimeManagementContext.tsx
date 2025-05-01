
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { TimeOffRequest, User } from "@/types";
import { useCommunications } from "@/hooks/useCommunications";
import { useProcessMessages } from "@/hooks/communications/useProcessMessages";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TimeManagementContextType {
  timeOffRequests: TimeOffRequest[];
  loading: boolean;
  error: Error | null;
  activeTab: string;
  retryCount: number;
  pendingRequests: TimeOffRequest[];
  userRequests: TimeOffRequest[];
  processedMessages: any[];
  messagesLoading: boolean;
  messagesError: any;
  respondToShiftRequest: any;
  setActiveTab: (tab: string) => void;
  fetchRequests: () => Promise<void>;
  refreshMessages: () => void;
  forceRefreshData: () => void;
  handleRetry: () => void;
}

const TimeManagementContext = createContext<TimeManagementContextType | undefined>(undefined);

export const useTimeManagement = () => {
  const context = useContext(TimeManagementContext);
  if (context === undefined) {
    throw new Error("useTimeManagement must be used within a TimeManagementProvider");
  }
  return context;
};

interface TimeManagementProviderProps {
  children: ReactNode;
  currentUser: User | null;
}

export const TimeManagementProvider: React.FC<TimeManagementProviderProps> = ({
  children,
  currentUser,
}) => {
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState("my-requests");
  const [retryCount, setRetryCount] = useState(0);
  
  // Get communications data for shift coverage requests
  const { 
    messages: rawMessages, 
    isLoading: messagesLoading, 
    error: messagesError, 
    respondToShiftRequest, 
    refreshMessages 
  } = useCommunications();
  
  const processedMessages = useProcessMessages(rawMessages, currentUser);

  const fetchRequests = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching time off requests for user:", currentUser.id);
      const { data, error: fetchError } = await supabase
        .from("time_off_requests")
        .select("*");
        
      if (fetchError) {
        console.error("Supabase error:", fetchError);
        throw fetchError;
      }
      
      if (data) {
        console.log(`Retrieved ${data.length} time off requests:`, data);
        setTimeOffRequests(
          data.map((r: any) => ({
            ...r,
            startDate: new Date(r.start_date),
            endDate: new Date(r.end_date),
            status: r.status,
            id: r.id,
            reason: r.reason,
            userId: r.user_id,
            notes: r.notes,
          }))
        );
        
        // Show success notification after successful fetch to provide user feedback
        if (retryCount > 0) {
          toast.success("Time off requests refreshed successfully");
        }
      } else {
        console.log("No time off requests data returned");
        setTimeOffRequests([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch time-off requests:", err);
      setError(err);
      toast.error("Failed to fetch time-off requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, retryCount]);

  // Retry logic for failed fetches
  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
    toast.info("Retrying data fetch...");
    fetchRequests();
    refreshMessages();
  };

  // Force refresh of data
  const forceRefreshData = useCallback(() => {
    setRetryCount(prevCount => prevCount + 1);
    fetchRequests();
    refreshMessages();
  }, [fetchRequests, refreshMessages]);

  React.useEffect(() => {
    if (currentUser) {
      fetchRequests();
      refreshMessages(); // Also fetch messages for shift coverage requests
    }
  }, [currentUser, fetchRequests, refreshMessages]);

  // Derived state
  const pendingRequests = timeOffRequests.filter(
    (request) => request.status === "pending"
  );
  
  const userRequests = timeOffRequests.filter(
    (request) => request.userId === currentUser?.id
  );

  const value = {
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

