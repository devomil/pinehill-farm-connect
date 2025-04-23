
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useDashboardData() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  // Fetch pending time off requests (for admin)
  const { data: pendingTimeOff } = useQuery({
    queryKey: ['pendingTimeOff'],
    queryFn: async () => {
      if (!isAdmin) return [];
      const { data, error } = await supabase
        .from('time_off_requests')
        .select('*')
        .eq('status', 'pending');
      
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin
  });

  // Fetch user's own time off requests
  const { data: userTimeOff } = useQuery({
    queryKey: ['userTimeOff', currentUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_off_requests')
        .select('*')
        .eq('user_id', currentUser?.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.id
  });

  // Fetch recent announcements
  const { data: announcements } = useQuery({
    queryKey: ['recentAnnouncements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch assigned trainings
  const { data: assignedTrainings } = useQuery({
    queryKey: ['assignedTrainings', currentUser?.id],
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
    enabled: !!currentUser?.id
  });

  return {
    pendingTimeOff,
    userTimeOff,
    announcements,
    assignedTrainings,
    isAdmin
  };
}
