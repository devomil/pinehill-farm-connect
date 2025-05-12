
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useCallback, useEffect } from "react";
import { TimeOffRequest } from "@/types/timeManagement";
import { Communication } from "@/types/communications/communicationTypes";
import { useProcessMessages } from "@/hooks/communications/useProcessMessages";
import { transformRawAnnouncements } from "@/utils/announcementUtils";

export function useDashboardData() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  const [retryCount, setRetryCount] = useState(0);
  
  // Log when the hook is initialized or retries
  useEffect(() => {
    console.log(`useDashboardData: Initialized with retryCount=${retryCount}, user=${currentUser?.id}, isAdmin=${isAdmin}`);
  }, [retryCount, currentUser, isAdmin]);

  // Fetch pending time off requests (for admin)
  const { data: pendingTimeOff, error: pendingTimeOffError, refetch: refetchPendingTimeOff } = useQuery({
    queryKey: ['pendingTimeOff', retryCount],
    queryFn: async () => {
      if (!isAdmin) return [];
      
      console.log("Fetching pending time off requests for admin");
      
      // Join with profiles to get employee names
      const { data, error } = await supabase
        .from('time_off_requests')
        .select(`
          *,
          profiles:user_id (name, email)
        `)
        .eq('status', 'pending');
      
      if (error) {
        console.error("Error fetching pending time off:", error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} pending time off requests`);
      
      // Transform the data to match our TimeOffRequest type with both snake_case and camelCase
      return data ? data.map((r: any) => ({
        ...r,  // Keep original fields
        startDate: new Date(r.start_date),
        endDate: new Date(r.end_date),
        userId: r.user_id
      })) as unknown as TimeOffRequest[] : [];
    },
    enabled: !!currentUser?.id && isAdmin,
    staleTime: 30000, // Add stale time to reduce unnecessary refetches
    retry: 3
  });

  // Fetch user's own time off requests
  const { data: userTimeOff, error: userTimeOffError, refetch: refetchUserTimeOff } = useQuery({
    queryKey: ['userTimeOff', currentUser?.id, retryCount],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      
      console.log(`Fetching time off requests for user ${currentUser.id}`);
      
      const { data, error } = await supabase
        .from('time_off_requests')
        .select('*')
        .eq('user_id', currentUser.id);
      
      if (error) {
        console.error("Error fetching user time off:", error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} time off requests for user`);
      
      // Transform the data to match our TimeOffRequest type
      return data ? data.map((r: any) => ({
        ...r,  // Keep original fields
        startDate: new Date(r.start_date),
        endDate: new Date(r.end_date),
        userId: r.user_id
      })) as unknown as TimeOffRequest[] : [];
    },
    enabled: !!currentUser?.id,
    staleTime: 30000,
    retry: 3
  });

  // Fetch shift coverage requests with improved query and error handling
  const { data: shiftCoverageMessagesRaw, error: shiftCoverageError, refetch: refetchShiftCoverage } = useQuery({
    queryKey: ['shiftCoverage', currentUser?.id, retryCount],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      
      console.log(`Fetching shift coverage data for ${currentUser?.name} (${currentUser?.id}), role: ${currentUser?.role}`);
      
      try {
        let messageQuery;
        
        // For admin users, fetch ALL shift coverage messages
        if (isAdmin) {
          console.log("Admin user - fetching ALL shift coverage messages");
          messageQuery = supabase
            .from('employee_communications')
            .select('*')
            .eq('type', 'shift_coverage');
        } else {
          // For regular users, fetch only messages where they're the sender or recipient
          console.log("Regular user - fetching only relevant shift coverage messages");
          messageQuery = supabase
            .from('employee_communications')
            .select('*')
            .eq('type', 'shift_coverage')
            .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`);
        }
        
        const { data: messages, error: messagesError } = await messageQuery;
        
        if (messagesError) {
          console.error("Error fetching shift coverage messages:", messagesError);
          throw messagesError;
        }
        
        console.log(`Found ${messages?.length || 0} shift coverage messages`);
        
        // If we have messages, fetch all related shift coverage requests in one batch
        if (messages && messages.length > 0) {
          const messageIds = messages.map(msg => msg.id);
          
          const { data: allShiftRequests, error: shiftRequestsError } = await supabase
            .from('shift_coverage_requests')
            .select('*')
            .in('communication_id', messageIds);
          
          if (shiftRequestsError) {
            console.error("Error fetching shift requests:", shiftRequestsError);
            throw shiftRequestsError;
          }
          
          console.log(`Found ${allShiftRequests?.length || 0} shift coverage requests`);
          
          // Create a map of communication_id to shift requests for efficient lookup
          const requestsByCommId = {};
          if (allShiftRequests) {
            allShiftRequests.forEach(req => {
              if (!requestsByCommId[req.communication_id]) {
                requestsByCommId[req.communication_id] = [];
              }
              requestsByCommId[req.communication_id].push(req);
            });
          }
          
          // Attach shift coverage requests to each message
          const messagesWithRequests = messages.map(msg => {
            const shiftRequests = requestsByCommId[msg.id] || [];
            
            // Add debug info for each message
            if (shiftRequests.length > 0) {
              console.log(`Message ${msg.id} has ${shiftRequests.length} shift requests`);
              const sampleRequest = shiftRequests[0];
              console.log(`Status: ${sampleRequest.status}, From: ${sampleRequest.original_employee_id}, To: ${sampleRequest.covering_employee_id}`);
            } else {
              console.log(`Message ${msg.id} has no shift requests despite being a shift_coverage type`);
            }
            
            return { ...msg, shift_coverage_requests: shiftRequests };
          });
          
          // Filter to only include messages with actual shift coverage requests
          const validMessages = messagesWithRequests.filter(msg => 
            msg.shift_coverage_requests && msg.shift_coverage_requests.length > 0
          );
          
          console.log(`After filtering for valid shift requests: ${validMessages.length} messages remain`);
          return validMessages;
        }
        
        console.log("No shift coverage messages found");
        return [];
      } catch (err) {
        console.error("Error in shift coverage data query:", err);
        throw err;
      }
    },
    enabled: !!currentUser?.id,
    staleTime: 15000, // Shorter stale time to ensure more frequent refreshes
    retry: 3
  });

  // Process the raw messages into properly typed Communication objects
  const shiftCoverageMessages = useProcessMessages(shiftCoverageMessagesRaw, currentUser);

  // Fetch recent announcements
  const { data: rawAnnouncements, error: announcementsError, refetch: refetchAnnouncements } = useQuery({
    queryKey: ['recentAnnouncements', retryCount],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
    retry: 3
  });
  
  // Transform raw announcements to include readBy field
  const announcements = rawAnnouncements ? 
    transformRawAnnouncements(rawAnnouncements, currentUser?.id) :
    [];

  // Fetch announcement read status for current user
  const { data: readReceipts } = useQuery({
    queryKey: ['announcementReadReceipts', currentUser?.id, retryCount],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      
      const { data, error } = await supabase
        .from('announcement_recipients')
        .select('*')
        .eq('user_id', currentUser.id);
        
      if (error) {
        console.error("Error fetching announcement receipts:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!currentUser?.id,
    staleTime: 30000
  });
  
  // Apply read receipts to announcements
  if (readReceipts && announcements) {
    announcements.forEach(announcement => {
      const receipt = readReceipts.find(r => r.announcement_id === announcement.id);
      if (receipt?.read_at && currentUser?.id && !announcement.readBy.includes(currentUser.id)) {
        announcement.readBy.push(currentUser.id);
      }
    });
  }

  // Fetch assigned trainings
  const { data: assignedTrainings, error: assignedTrainingsError, refetch: refetchTrainings } = useQuery({
    queryKey: ['assignedTrainings', currentUser?.id, retryCount],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_assignments')
        .select(`
          *,
          trainings (
            title,
            duration,
            expires_after
          )
        `)
        .eq('user_id', currentUser?.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.id,
    staleTime: 30000,
    retry: 3
  });

  // Refetch data with improved logging
  const refetchData = useCallback(() => {
    console.log("Manually refreshing dashboard data");
    setRetryCount(prev => prev + 1);
    
    // Force refetches for improved reliability
    if (currentUser?.id) {
      setTimeout(() => {
        refetchPendingTimeOff();
        refetchUserTimeOff();
        refetchShiftCoverage();
        refetchAnnouncements();
        refetchTrainings();
      }, 100);
    }
  }, [
    currentUser?.id, 
    refetchPendingTimeOff, 
    refetchUserTimeOff, 
    refetchShiftCoverage, 
    refetchAnnouncements,
    refetchTrainings
  ]);

  // Determine if any data is still loading
  const loading = (!pendingTimeOff && isAdmin) || 
                  (!userTimeOff && !!currentUser?.id) || 
                  (!shiftCoverageMessages && !!currentUser?.id) || 
                  !rawAnnouncements;
  
  // Consolidate errors
  const error = pendingTimeOffError || 
                userTimeOffError || 
                shiftCoverageError || 
                announcementsError || 
                assignedTrainingsError || 
                null;

  return {
    pendingTimeOff,
    userTimeOff,
    shiftCoverageMessages,
    announcements,
    assignedTrainings,
    isAdmin,
    refetchData,
    loading,
    error
  };
}
