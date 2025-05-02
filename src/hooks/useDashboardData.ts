
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useCallback } from "react";
import { TimeOffRequest } from "@/types/timeManagement";
import { Communication } from "@/types/communications/communicationTypes";
import { useProcessMessages } from "@/hooks/communications/useProcessMessages";

export function useDashboardData() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  const [retryCount, setRetryCount] = useState(0);

  // Fetch pending time off requests (for admin)
  const { data: pendingTimeOff, error: pendingTimeOffError, refetch: refetchPendingTimeOff } = useQuery({
    queryKey: ['pendingTimeOff', retryCount],
    queryFn: async () => {
      if (!isAdmin) return [];
      
      // Join with profiles to get employee names
      const { data, error } = await supabase
        .from('time_off_requests')
        .select(`
          *,
          profiles:user_id (name, email)
        `)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      // Transform the data to match our TimeOffRequest type
      return data ? data.map((r: any) => ({
        id: r.id,
        startDate: new Date(r.start_date),
        endDate: new Date(r.end_date),
        status: r.status,
        userId: r.user_id,
        reason: r.reason,
        notes: r.notes,
        profiles: r.profiles
      })) as TimeOffRequest[] : [];
    },
    enabled: isAdmin,
    staleTime: 30000, // Add stale time to reduce unnecessary refetches
    retry: 3
  });

  // Fetch user's own time off requests
  const { data: userTimeOff, error: userTimeOffError, refetch: refetchUserTimeOff } = useQuery({
    queryKey: ['userTimeOff', currentUser?.id, retryCount],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_off_requests')
        .select('*')
        .eq('user_id', currentUser?.id);
      
      if (error) throw error;
      
      // Transform the data to match our TimeOffRequest type
      return data ? data.map((r: any) => ({
        id: r.id,
        startDate: new Date(r.start_date),
        endDate: new Date(r.end_date),
        status: r.status,
        userId: r.user_id,
        reason: r.reason,
        notes: r.notes
      })) as TimeOffRequest[] : [];
    },
    enabled: !!currentUser?.id,
    staleTime: 30000,
    retry: 3
  });

  // Fetch shift coverage requests with improved query and error handling
  const { data: shiftCoverageMessagesRaw, error: shiftCoverageError, refetch: refetchShiftCoverage } = useQuery({
    queryKey: ['shiftCoverage', currentUser?.id, retryCount],
    queryFn: async () => {
      console.log(`Fetching shift coverage data for ${currentUser?.name} (${currentUser?.id}), role: ${currentUser?.role}`);
      
      try {
        // For admin users, fetch all shift coverage messages
        // For regular users, fetch only messages where they're the sender or recipient
        const messageQuery = supabase
          .from('employee_communications')
          .select('*')
          .eq('type', 'shift_coverage');
          
        if (!isAdmin) {
          messageQuery.or(`sender_id.eq.${currentUser?.id},recipient_id.eq.${currentUser?.id}`);
        }
        
        const { data: messages, error: messagesError } = await messageQuery;
        
        if (messagesError) {
          console.error("Error fetching shift coverage messages:", messagesError);
          throw messagesError;
        }
        
        console.log(`Found ${messages?.length || 0} shift coverage messages`);
        
        // Now fetch the related shift coverage requests
        if (messages && messages.length > 0) {
          const messagesWithRequests = await Promise.all(
            messages.map(async (msg) => {
              try {
                const { data: shiftRequests, error: shiftError } = await supabase
                  .from('shift_coverage_requests')
                  .select('*')
                  .eq('communication_id', msg.id);
                  
                if (shiftError) {
                  console.error(`Error fetching shift requests for message ${msg.id}:`, shiftError);
                  return { ...msg, shift_coverage_requests: [] };
                }
                
                if (shiftRequests && shiftRequests.length > 0) {
                  console.log(`Message ${msg.id} has ${shiftRequests.length} shift requests`);
                  console.log(`Status: ${shiftRequests[0].status}, From: ${shiftRequests[0].original_employee_id}, To: ${shiftRequests[0].covering_employee_id}`);
                } else {
                  console.log(`Message ${msg.id} has no shift requests despite being a shift_coverage type`);
                }
                
                return { ...msg, shift_coverage_requests: shiftRequests || [] };
              } catch (err) {
                console.error(`Error processing message ${msg.id}:`, err);
                return { ...msg, shift_coverage_requests: [] };
              }
            })
          );
          
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
  const { data: announcements, error: announcementsError } = useQuery({
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

  // Fetch assigned trainings
  const { data: assignedTrainings, error: assignedTrainingsError } = useQuery({
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
  }, []);

  // Determine if any data is still loading
  const loading = (!pendingTimeOff && isAdmin) || 
                  (!userTimeOff && !!currentUser?.id) || 
                  (!shiftCoverageMessages && !!currentUser?.id) || 
                  !announcements;
  
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
