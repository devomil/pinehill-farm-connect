
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
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
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [requestsSubscribed, setRequestsSubscribed] = useState(false);
  
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
    
    // Don't show loading state for subsequent refreshes if we already have data
    if (!initialFetchDone) {
      setLoading(true);
    }
    
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
        console.log(`Retrieved ${data.length} time off requests`);
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
        
        // Only show success notification for manual refreshes, not initial load
        if (retryCount > 0) {
          toast.success("Time off requests refreshed successfully");
        }
      } else {
        console.log("No time off requests data returned");
        setTimeOffRequests([]);
      }
      
      setInitialFetchDone(true);
    } catch (err: any) {
      console.error("Failed to fetch time-off requests:", err);
      setError(err);
      // Only show error for manual retries, not initial load failures which we'll handle silently
      if (retryCount > 0) {
        toast.error("Failed to fetch time-off requests. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, retryCount]);

  // Setup realtime subscription for time_off_requests table
  useEffect(() => {
    if (!currentUser || requestsSubscribed) return;
    
    // Set up subscription for real-time updates
    const channel = supabase
      .channel('time-off-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'time_off_requests' 
      }, () => {
        console.log('Received time-off request update via realtime');
        fetchRequests();
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setRequestsSubscribed(true);
      });

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
      setRequestsSubscribed(false);
    };
  }, [currentUser, fetchRequests, requestsSubscribed]);

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

  // Initial data fetch
  useEffect(() => {
    if (currentUser) {
      fetchRequests();
      refreshMessages();
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
