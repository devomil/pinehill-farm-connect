import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useCallback } from "react";
import { TimeOffRequest } from "@/types/timeManagement";

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

  // Refetch time off data
  const refetchTimeOff = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  // Determine if any data is still loading
  const loading = (!pendingTimeOff && isAdmin) || (!userTimeOff && !!currentUser?.id) || !announcements;
  
  // Consolidate errors
  const error = pendingTimeOffError || userTimeOffError || announcementsError || assignedTrainingsError || null;

  return {
    pendingTimeOff,
    userTimeOff,
    announcements,
    assignedTrainings,
    isAdmin,
    refetchTimeOff,
    loading,
    error
  };
}
