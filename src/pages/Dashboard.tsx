import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AdminTimeOffCard } from "@/components/dashboard/AdminTimeOffCard";
import { TrainingCard } from "@/components/dashboard/TrainingCard";
import { TimeOffRequestsCard } from "@/components/dashboard/TimeOffRequestsCard";
import { AnnouncementsCard } from "@/components/dashboard/AnnouncementsCard";
import { DashboardAlert } from "@/components/dashboard/DashboardAlert";

export default function Dashboard() {
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

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <DashboardHeader userName={currentUser?.name || ''} />

        {isAdmin && pendingTimeOff && (
          <AdminTimeOffCard count={pendingTimeOff.length || 0} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {assignedTrainings && assignedTrainings.length > 0 && (
            <TrainingCard trainings={assignedTrainings} />
          )}

          {userTimeOff && userTimeOff.length > 0 && (
            <TimeOffRequestsCard requests={userTimeOff} />
          )}

          {announcements && announcements.length > 0 && (
            <AnnouncementsCard announcements={announcements} />
          )}
        </div>

        {assignedTrainings && assignedTrainings.length > 0 && (
          <DashboardAlert trainingCount={assignedTrainings.length} />
        )}
      </div>
    </DashboardLayout>
  );
}
