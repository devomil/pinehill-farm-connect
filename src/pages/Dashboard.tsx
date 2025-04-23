
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AdminTimeOffCard } from "@/components/dashboard/AdminTimeOffCard";
import { TrainingCard } from "@/components/dashboard/TrainingCard";
import { TimeOffRequestsCard } from "@/components/dashboard/TimeOffRequestsCard";
import { AnnouncementsCard } from "@/components/dashboard/AnnouncementsCard";
import { DashboardAlert } from "@/components/dashboard/DashboardAlert";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { 
    pendingTimeOff,
    userTimeOff,
    announcements,
    assignedTrainings,
    isAdmin 
  } = useDashboardData();

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
